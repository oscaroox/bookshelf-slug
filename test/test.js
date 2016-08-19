'use strict';
let chai = require('chai');
let expect = chai.expect;
let Post = require('./database/models/Post');
let User = require('./database/models/User');
let knex = require('./database').knex;
describe('bookshelf-slug', () => {
  let postId;
  let userId;
  after((done) => {
    knex.raw("delete from post")
      .then(() => knex.raw("delete from user"))
      .then(model => done())
      .catch(err => done(err));
  })
  it('should create a post with a unique slug, with default column name: slug', (done) => {
    new Post({
      title: 'Fancy cats with hats',
      description: 'This is a funny post about cats with hats',
      content: 'Long content',
      posted_on: new Date(),
      updated_on: new Date()
    })
    .save()
    .then(function(model) {
      postId = model.get('id')
      expect(model.get('slug')).to.equal('fancy-cats-with-hats-this-is-a-funny-post-about-cats-with-hats')
      done();
    }).catch(err => done(err))

  });

  it('should update a existing post with a unique slug, with default column name: slug', (done) => {
    Post.forge({id: postId})
      .save({
        description: 'Post with pictures of dogs'
      })
      .then(model => {
        expect(model.get('slug')).to.equal('fancy-cats-with-hats-post-with-pictures-of-dogs')
        done();
      })
  });

  it('should create a new user with a unique slug, with specified column name: uniqueName', done => {
    User.forge({
      firstName: 'Donald',
      lastName: 'Duck',
      nickName: 'The duck',
      dob: new Date()
    })
    .save()
    .then(model => {
      expect(model.get('uniqueName')).to.equal('donald-duck-the-duck');
      userId = model.get('id')
      done();
    })
  });

  it('should update a existing user with a unique slug, with specified column name: uniqueName', (done) => {
    User.forge({id: userId})
      .save({
        firstName: 'Dolan'
      })
      .then(model => {
        expect(model.get('uniqueName')).to.equal('dolan-duck-the-duck')
        done();
      })
  });
  it('should create a unique slug with existing slug sources', function(done){
    let obj = {
      firstName: 'Dolan',
      lastName: 'Duck',
      nickName: 'The duck',
      dob: new Date()
    }
    User.forge(obj)
      .save()
      .then(model => {
        expect(model.get('uniqueName')).to.not.equal('dolan-duck-the-duck');
        done();
      })
  });
});
