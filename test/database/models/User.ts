import { bookshelf } from "..";
// import "./Post";
// require("./Post.js");

export default bookshelf.model("User", {
  tableName: "user",
  requireFetch: false,
  post: function (this: any) {
    return this.hasMany("Post");
  },
});
