import Bookshelf from "bookshelf";
import { bookshelf } from "..";

//  require('./User');

export default bookshelf.model("Post", {
  tableName: "post",
  requireFetch: false,
  slug: ["title", "description"],
  user: function (this: any) {
    return this.belongsTo("User");
  },
});
