import { hasOwn, getCurrentPage } from '@theme/utils'

export default function blog (Vue) {
  Vue.mixin({
    created () {
      const { post: { cover } } = this.$themeConfig
      if (!this.$posts) {
        const today = new Date().toLocaleDateString()
        const { pages } = this.$site
        let posts = {}
        if (pages && pages.length) {
          posts = pages.filter(page => {
            const { wordCount } = page
            return !(wordCount === undefined)
          })
          for (const post of posts) {
            const { frontmatter: { created, updated, banner }, path } = post
            if (banner) {
              post.frontmatter.banner = this.$withBase(banner)
            } else {
              if (cover && cover.length) {
                post.frontmatter.banner = this.$withBase(cover[Math.floor(Math.random() * cover.length)])
              } else {
                post.frontmatter.banner = require(`@theme/assets/post/${Math.floor(Math.random() * 20) + 1}.svg`)
              }
            }
            if (created) {
              post.frontmatter.created = new Date(created).toLocaleDateString()
            } else {
              post.frontmatter.created = today
            }
            if (updated) {
              post.frontmatter.updated = new Date(updated).toLocaleDateString()
            } else {
              post.frontmatter.updated = today
            }
            if (path) {
              post.category = getCurrentPage(path)
            }
          }
          posts.sort((a, b) => {
            return new Date(b.frontmatter.created).getTime() - new Date(a.frontmatter.created).getTime()
          })
          posts.sort((a, b) => {
            return new Date(b.frontmatter.updated).getTime() - new Date(a.frontmatter.updated).getTime()
          })
        }
        Vue.prototype.$posts = posts
      }

      if (!this.$categories) {
        const { navs } = this.$config
        const categories = {}
        if (navs && navs.length) {
          navs.forEach(nav => {
            categories[nav.link.substring(1, nav.link.length - 1)] = []
          })
          if (this.$posts.length) {
            this.$posts.forEach(post => {
              const { category } = post
              if (category) {
                categories[category].push(post)
              }
            })
          }
        }
        Vue.prototype.$categories = categories
      }

      if (!this.$tags) {
        const _tags = {}
        if (this.$posts.length) {
          for (const post of this.$posts) {
            const { tags } = post.frontmatter
            if (tags && tags.length) {
              for (const tag of tags) {
                if (!hasOwn(_tags, tag)) {
                  _tags[tag] = []
                }
                _tags[tag].push(post)
              }
            }
          }
        }
        Vue.prototype.$tags = _tags
      }
    },
  })
}
