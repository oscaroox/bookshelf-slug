import chai from "chai";
import { knex, bookshelf } from "./database";
import { Post, User, Article } from "./database/models";
import Bookshelf from "bookshelf";

let expect = chai.expect;

describe("bookshelf-slug", () => {
  let postId;
  let userId;
  before(() => {
    return knex.raw("delete from post")
      .then(() => knex.raw("delete from user"))
      .then(() => knex.raw("delete from articles"));
  });

  after(() => {
    return knex.destroy();
  });

  describe("unique values", () => {
    beforeEach(async () => await knex.raw("delete from articles"));

    it("will append date if slug is already taken", async () => {
      const first_article = await new Article({
        title: "The best news",
        slug: "the-best-news",
      }).save();

      const second_article = await new Article({
        title: "The best news",
        slug: "the-best-news",
      }).save();

      expect(
        await Article.where<Bookshelf.Model<any>>({ slug: "the-best-news" })
          .count(),
      ).to.equal(
        1,
      );
      expect(second_article.get("slug")).to.not.equal(
        first_article.get("slug"),
      );
    });

    it("will not update slug without changes", async () => {
      const first_article = await new Article({
        title: "The best news",
        slug: "the-best-news",
      }).save();

      expect(first_article.get("slug")).to.equal("the-best-news");
      await first_article.save();
      expect(first_article.get("slug")).to.equal("the-best-news");
    });

    it("will update slug when field has changed", async () => {
      const article = await new Article({
        title: "The best news",
        slug: "the-best-news",
      }).save();

      expect(article.get("slug")).to.equal("the-best-news");

      article.set("title", "The next best news");
      await article.save();
      expect(article.get("slug")).to.equal("the-next-best-news");
    });
  });

  it("should create a post with a unique slug, with default column name: slug", (
    done,
  ) => {
    new Post({
      user_id: 1,
      title: "Fancy cats with hats",
      description: "This is a funny post about cats with hats",
      content: "Long content",
      posted_on: new Date(),
      updated_on: new Date(),
    })
      .save()
      .then(function (model) {
        postId = model.get("id");
        expect(model.get("slug")).to.equal(
          "fancy-cats-with-hats-this-is-a-funny-post-about-cats-with-hats",
        );
        done();
      }).catch((err) => done(err));
  });

  it("should create a post with a unique slug, even if the post has a default ID assigned", (
    done,
  ) => {
    const id = 42;
    const post = new Post({
      user_id: 1,
      title: "Crocodiles",
      description: "See you later, alligator",
      content: "Alligators are not crocodiles",
      posted_on: new Date(),
      updated_on: new Date(),
    });
    (post as any).defaults = { id };
    post.save()
      .then(function (model) {
        expect(model.get("slug")).to.equal(
          "crocodiles-see-you-later-alligator",
        );
        expect(model.get("id")).to.equal(id);
        done();
      }).catch((err) => done(err));
  });

  it("should update a existing post with a unique slug, with default column name: slug", (
    done,
  ) => {
    Post.forge<Bookshelf.Model<any>>({ id: postId })
      .save({
        description: "Post with pictures of dogs",
      })
      .then((model) => {
        expect(model.get("slug")).to.equal(
          "fancy-cats-with-hats-post-with-pictures-of-dogs",
        );
        done();
      });
  });

  it("should create a new user with a unique slug, with specified column name: uniqueName", (
    done,
  ) => {
    User.forge<Bookshelf.Model<any>>({
      firstName: "Donald",
      lastName: "Duck",
      nickName: "The duck",
      dob: new Date(),
    })
      .save()
      .then((model) => {
        expect(model.get("uniqueName")).to.equal("donald-duck-the-duck");
        userId = model.get("id");
        done();
      });
  });

  it("should update a existing user with a unique slug, with specified column name: uniqueName", (
    done,
  ) => {
    User.forge<Bookshelf.Model<any>>({ id: userId })
      .save({
        firstName: "Dolan",
      })
      .then((model) => {
        expect(model.get("uniqueName")).to.equal("dolan-duck-the-duck");
        done();
      });
  });

  it("should create a unique slug with existing slug sources", function (done) {
    User.forge<Bookshelf.Model<any>>({
      firstName: "Dolan",
      lastName: "Duck",
      nickName: "The duck",
      dob: new Date(),
    })
      .save()
      .then((model) => {
        expect(model.get("uniqueName")).to.not.equal("dolan-duck-the-duck");
        done();
      });
  });

  let posts = [{
    title: "Rediscover New York ",
    description: "Dive deep into the unkown parts of New York",
    content: "Long content",
  }, {
    title: "Hiking through Europe",
    description: "Hiking through Europe",
    content: "Europe content bla",
  }, {
    title: "Walking dead season 7 reveal",
    description: "Previously on the walking dead",
    content: "walking dead content",
  }];

  it("should work with transactions", function (done) {
    bookshelf.transaction((t) => {
      return User.forge<Bookshelf.Model<any>>({
        firstName: "Theodore",
        lastName: "Douglas",
        nickName: "One true god",
        dob: new Date(),
      })
        .save(null, { transacting: t })
        .tap((model) => {
          expect(model.get("uniqueName")).to.equal(
            "theodore-douglas-one-true-god",
          );

          return posts.map((post) => {
            return Post.forge<Bookshelf.Model<any>>(post).save(
              { "user_id": model.get("id") },
              { transacting: t },
            );
          });
        });
    }).then((model) => {
      return model
        .related("post")
        .fetch()
        .then(function (posts) {
          posts = posts.pluck("slug");
          expect(posts).to.include(
            "rediscover-new-york-dive-deep-into-the-unkown-parts-of-new-york",
          );
          expect(posts).to.include(
            "hiking-through-europe-hiking-through-europe",
          );
          expect(posts).to.include(
            "walking-dead-season-7-reveal-previously-on-the-walking-dead",
          );
          done();
        });
    });
  });
});
