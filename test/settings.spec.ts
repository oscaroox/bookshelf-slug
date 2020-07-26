import { bookshelfSlugPlugin } from "./../lib/plugin";
import Bookshelf from "bookshelf";
import { PluginSettings } from "./../lib/interfaces";
import chai from "chai";
import { knex } from "./database";
import faker from "faker";

let expect = chai.expect;

const createPostModel = (settings: PluginSettings = {}) => {
  let bookshelf = Bookshelf(knex as any);

  bookshelf.plugin(bookshelfSlugPlugin(settings));

  const Post = bookshelf.model("Post", {
    tableName: "post",
    requireFetch: false,
    slug: ["title", "description"],
  });

  return Post;
};

describe("bookshelf-slug settings", () => {
  describe("generateId option", () => {
    it("should append a custom id if slug exists", async () => {
      const Post = createPostModel({
        generateId() {
          return "123abc123";
        },
      });

      const title = faker.lorem.word();
      const description = faker.lorem.words(3);
      await new Post({
        title,
        description,
      }).save();

      const post2 = await new Post({
        title,
        description,
      }).save();

      const slug = (post2.get("slug") as string).split("-").slice(-1)[0];
      expect(slug).not.null;
      expect(slug).equal("123abc123");
    });
  });

  describe("slugify settings", () => {
    it("should pass settings to slugify package", async () => {
      const Post = createPostModel({
        lower: false,
        replacement: ";",
        remove: /[*+~.()'"!:@]/g,
        strict: true,
      });

      const title = "Title++^^*!'@";
      const description = "Apple Orange";
      const expectedSlug = "Title;Apple;Orange";

      const post = await new Post({
        title,
        description,
      }).save();

      expect(post.get("slug")).equal(expectedSlug);
    });
  });
});
