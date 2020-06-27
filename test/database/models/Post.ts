import { bookshelf } from "..";

//  require('./User');

export default bookshelf.model("Post", {
  tableName: "post",
  requireFetch: false,
  slug: ["title", "description"],
  user: function () {
    return this.belongsTo("User");
  },
});
