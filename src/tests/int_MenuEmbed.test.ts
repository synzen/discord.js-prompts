import { MenuEmbed } from "../MenuEmbed"

describe('Int::MenuEmbed', () => {
  describe('isValidSelection', () => {
    it('returns correctly for multiselect', () => {
      const menu = new MenuEmbed(undefined, {
        multiSelect: true
      })
      menu
        .addOption('a')
        .addOption('b')
        .addOption('c')
      expect(menu.isValidSelection('1,2,3'))
        .toEqual(true)
      expect(menu.isValidSelection('0,2,3'))
        .toEqual(false)
      expect(menu.isValidSelection('1,2,4'))
        .toEqual(false)
    })
    it('returns correctly for non-multiselect', () => {
      const menu = new MenuEmbed()
      menu
        .addOption('a')
        .addOption('b')
        .addOption('c')
      expect(menu.isValidSelection('1,2,3'))
        .toEqual(false)
      expect(menu.isValidSelection('1'))
        .toEqual(true)
    })
  })
  describe('spansMultiplePages', () => {
    it('returns correctly for custom maxPerpage', () => {
      const menu = new MenuEmbed(undefined, {
        maxPerPage: 2
      })
      menu
        .addOption('a')
        .addOption('b')
        .addOption('c')
      expect(menu.spansMultiplePages())
        .toEqual(true)
      const menu2 = new MenuEmbed(undefined, {
        maxPerPage: 2
      })
      menu2
        .addOption('a')
      expect(menu2.spansMultiplePages())
        .toEqual(false)
    })
    it('returns correctly for default maxPerpage', () => {
      const menu = new MenuEmbed()
      menu
        .addOption('1')
        .addOption('2')
        .addOption('3')
        .addOption('4')
        .addOption('5')
        .addOption('6')
      expect(menu.spansMultiplePages())
        .toEqual(true)
      const menu2 = new MenuEmbed()
      menu2
        .addOption('1')
        .addOption('2')
        .addOption('3')
        .addOption('4')
      expect(menu2.spansMultiplePages())
        .toEqual(false)
    })
  })
})
