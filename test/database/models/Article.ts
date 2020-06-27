import { bookshelf } from "../";

export default bookshelf.model("Article", {
  tableName: "articles",
  requireFetch: false,
  slug: ["title"],
});
