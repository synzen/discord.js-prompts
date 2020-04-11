import { MessageOptions } from 'discord.js'
import { MenuVisual } from '../../visuals/MenuVisual'
import { MenuEmbed } from '../../MenuEmbed'

describe('Unit::visuals/MenuVisual', () => {
  describe('constructor', () => {
    it('works', () => {
      const menu = new MenuEmbed()
      const options = {
        a: 'b'
      } as MessageOptions
      const visual = new MenuVisual(menu, options)
      expect(visual.text).toEqual('')
      expect(visual.menu).toEqual(menu)
      expect(visual.options).toEqual(options)
    })
    it('allows optional options', () => {
      const menu = new MenuEmbed()
      const visual = new MenuVisual(menu)
      expect(visual.text).toEqual('')
      expect(visual.menu).toEqual(menu)
      expect(visual.options).toEqual(undefined)
    })
  })
})
