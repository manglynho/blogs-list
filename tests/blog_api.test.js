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


describe('Checking the Blogs lists', () => {
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
})

describe('viewing a specific blog entry', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    const processedBlogToView = JSON.parse(JSON.stringify(blogToView))
    expect(resultBlog.body).toEqual(processedBlogToView)
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()
    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '1a3d5da0000000a82aaaa4'
    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

describe('addition tests', () => {
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
})

describe('deletion tests', () => {

  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )
    const contents = blogsAtEnd.map(r => r.id)
    expect(contents).not.toContain(blogToDelete.id)
  })

})

describe('updating tests', () => {

  test('valid likes element update', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updateLikes = {
      likes: 9
    }
    const resultBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updateLikes)
      .expect(200)

    expect(resultBlog.body.likes).toEqual(9)
  })

})

afterAll(() => {
  mongoose.connection.close()
})