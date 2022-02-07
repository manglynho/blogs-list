require('lodash')
const lodash = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.map(el => el.likes).reduce((sum, val) => sum + val, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((max, blog) => max.likes > blog.likes ? max : blog)
}

const mostBlogs = (blogs) => {
  let ranking = lodash.countBy(blogs, 'author')
  let separated = lodash.map(ranking, function(el, index) {
    return {
      'author': index,
      'blogs': el
    }
  })
  return lodash.maxBy(separated, 'blogs')
}

const mostLikes= (blogs) => {
  let grouped = lodash(blogs)
    .groupBy('author')
    .map((objs, key) => ({
      'author': key,
      'likes': lodash.sumBy(objs, 'likes')
    }))
    .value()

  return lodash.maxBy(grouped, 'likes')
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}