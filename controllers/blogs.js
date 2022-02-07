const blogsRouter = require('express').Router()
const Blog = require('../models/blog')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body

  let likes = body.likes
  if(likes === undefined){
    likes = 0
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: likes
  })

  const savedBlog = await blog.save()
  response.json(savedBlog)

})

blogsRouter.get('/:id', async (request, response, next) => {

  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }

})

blogsRouter.delete('/:id', async (request, response, next) => {

  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()

})

blogsRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }


  Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .then(updatedBlog => {
      response.json(updatedBlog)
    })
    .catch(error => next(error))
})


module.exports = blogsRouter