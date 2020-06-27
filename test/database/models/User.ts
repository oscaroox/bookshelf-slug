import { bookshelf } from "..";

// require("./Post.js");

export default bookshelf.model("User", {
  tableName: "user",
  requireFetch: false,
  slug: {
    column: "uniqueName",
    items: ["firstName", "lastName", "nickName"],
  },
  post: function () {
    return this.hasMany("Post");
  },
});
