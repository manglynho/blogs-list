const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('ok blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
})

test('there are 6 elements', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('property id is defined', async () => {
  const response = await api.get('/api/blogs')
  //pick only first object response to check schema composition
  expect(response.body[0].id).toBeDefined()
})

test('new blog can be added', async () => {
  const newBlog = {
    title: 'New Blog',
    author: 'New author',
    url: 'new url',
    likes: 7,
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  const contents = blogsAtEnd.map(b => b.title)
  expect(contents).toContain(
    'New Blog'
  )
})

test('new blog no likes property', async () => {
  const newBlog = {
    title: 'New Blog',
    author: 'New author',
    url: 'new url',
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  const contents = blogsAtEnd.map(b => b.likes)
  expect(contents).toContain(0)
})

test('this should throw a 400 code', async () => {
  const newBlog = {
    url: 'new url',
    likes: 9
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
    //mongose schema throw 400 error on required fields...
})

afterAll(() => {
  mongoose.connection.close()
})