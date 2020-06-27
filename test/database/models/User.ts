import { bookshelf } from "..";
// import "./Post";
// require("./Post.js");

export default bookshelf.model("User", {
  tableName: "user",
  requireFetch: false,
  slug: {
    column: "uniqueName",
    items: ["firstName", "lastName", "nickName"],
  },
  post: function (this: any) {
    return this.hasMany("Post");
  },
});
