import { SlugOption } from "./../lib/interfaces";
import chai from "chai";
import { knex, bookshelf } from "./database";
import { Post, User } from "./database/models";
import Bookshelf from "bookshelf";
import faker from "faker";

let expect = chai.expect;

const createPostModel = (options: Partial<SlugOption> = {}) => {
  return Post.extend({
    slug: {
      items: ["title", "description"],
      ...options,
    } as Partial<SlugOption>,
  }) as typeof Bookshelf.Model;
};

describe("bookshelf-slug", () => {
  describe("unique option", () => {
    it("should create a post with a unique slug", async () => {
      let title = faker.lorem.word();
      let description = faker.lorem.words(3);
      let post = await new Post({
        title,
        description,
      }).save();

      let post2 = await new Post({
        title,
        description,
      }).save();
      expect(post.get("slug")).not.equal(post2.get("slug"));
    });

    it("should create a post with a unique slug, even if the post has a default ID assigned", async () => {
      const id = 42;
      const title = faker.lorem.word();
      const description = faker.lorem.words(3);
      const slug = faker.helpers
        .slugify(`${title} ${description}`)
        .toLowerCase();

      const post = new Post({
        title,
        description,
      });

      (post as any).defaults = { id };

      const model = await post.save();

      expect(model.get("slug")).to.equal(slug);
      expect(model.get("id")).to.equal(id);
    });

    it("should create a post with an existing slug", async () => {
      const _Post = createPostModel({ unique: false });

      const title = faker.lorem.word();
      const description = faker.lorem.words(3);

      const post = await new _Post({
        title,
        description,
      }).save();

      const post2 = await new _Post({
        title,
        description,
      }).save();

      expect(post.get("slug")).equal(post2.get("slug"));
    });
  });

  describe("column option", () => {
    it("should create a post using the specified column name", async () => {
      const _Post = createPostModel({ column: "second_slug" });

      const title = faker.lorem.word();
      const description = faker.lorem.words(3);
      const slug = faker.helpers
        .slugify(`${title} ${description}`)
        .toLowerCase();

      const post = await new _Post({
        title,
        description,
      }).save();

      expect(post.get("slug")).null;
      expect(post.get("second_slug")).equal(slug);
    });
  });

  describe("update option", () => {
    it("should update the slug when updating an existing post", async () => {
      const _Post = createPostModel({ update: true });

      const title = faker.lorem.word();
      const description = faker.lorem.words(3);
      const post = await new _Post({
        title,
        description,
      }).save();

      expect(post.get("slug")).equal(
        faker.helpers.slugify(`${title} ${description}`).toLowerCase()
      );

      const newTitle = faker.lorem.word();
      post.set("title", newTitle);
      await post.save();

      expect(post.get("slug")).equal(
        faker.helpers.slugify(`${newTitle} ${description}`).toLowerCase()
      );
    });
    it("should not update the slug if no values have changed", async () => {
      const _Post = createPostModel();

      const title = faker.lorem.word();
      const description = faker.lorem.words(3);
      const slug = faker.helpers
        .slugify(`${title} ${description}`)
        .toLowerCase();
      const post = await new _Post({ title, description }).save();

      post.set("user_id", 22);
      await post.save();

      expect(post.get("slug")).equal(slug);
    });
    it("should not update the slug when updating an existing post", async () => {
      const _Post = createPostModel({ update: false });

      const title = faker.lorem.word();

      const description = faker.lorem.words(3);
      const slug = faker.helpers
        .slugify(`${title} ${description}`)
        .toLowerCase();

      const post = await new _Post({ title, description }).save();

      const newTitle = faker.lorem.word();

      post.set("title", newTitle);
      await post.save();

      expect(post.get("slug")).equal(slug);
    });
  });

  describe("transaction", () => {
    it("should should attach posts to a user using transactions", async () => {
      let posts = [
        {
          title: "Rediscover New York ",
          description: "Dive deep into the unkown parts of New York",
        },
        {
          title: "Hiking through Europe",
          description: "Hiking through Europe",
        },
        {
          title: "Walking dead season 7 reveal",
          description: "Previously on the walking dead",
        },
      ];
      return bookshelf.transaction(async (t) => {
        const user: Bookshelf.Model<any> = await User.forge<
          Bookshelf.Model<any>
        >({
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          nickName: faker.name.firstName(),
          dob: new Date(),
        }).save(undefined, { transacting: t });

        await Promise.all(
          posts.map((post) => {
            return Post.forge<Bookshelf.Model<any>>(post).save(
              { user_id: user.get("id") },
              { transacting: t }
            );
          })
        );

        let userPosts: Bookshelf.Collection<any> = await user
          .related("post")
          .fetch({ transacting: t });
        const slugs = userPosts.pluck("slug");
        expect(slugs).to.include(
          "rediscover-new-york-dive-deep-into-the-unkown-parts-of-new-york"
        );
        expect(slugs).to.include("hiking-through-europe-hiking-through-europe");
        expect(slugs).to.include(
          "walking-dead-season-7-reveal-previously-on-the-walking-dead"
        );
      });
    });
  });
});
