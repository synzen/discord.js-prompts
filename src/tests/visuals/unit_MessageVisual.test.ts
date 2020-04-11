import { MessageVisual } from "../../visuals/MessageVisual"
import { MessageOptions } from "../../types/MessageOptions"

describe('Unit::visuals/MessageVisual', () => {
  describe('constructor', () => {
    it('works', () => {
      const text = 'qa3et46ry3h'
      const options = {
        a: 'b'
      } as MessageOptions
      const visual = new MessageVisual(text, options)
      expect(visual.text).toEqual(text)
      expect(visual.options).toEqual(options)
    })
    it('allows optional options', () => {
      const text = 'qa3et46ry3h'
      const visual = new MessageVisual(text)
      expect(visual.text).toEqual(text)
      expect(visual.options).toEqual(undefined)
    })
  })
})
