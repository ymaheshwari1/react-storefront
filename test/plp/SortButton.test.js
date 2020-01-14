import React from 'react'
import { mount } from 'enzyme'
import SearchResultsContext from 'react-storefront/plp/SearchResultsContext'
import { Router } from '../mocks/mockRouter'
import Drawer from 'react-storefront/drawer/Drawer'
import { Menu } from '@material-ui/core'
import Sort from 'react-storefront/plp/Sort'
import ActionButton from 'react-storefront/ActionButton'
import { act } from 'react-dom/test-utils'

describe('SortButton', () => {
  const sortOptions = [
    { name: 'Price - Lowest', code: 'price_asc' },
    { name: 'Price - Highest', code: 'price_desc' },
    { name: 'Most Popular', code: 'pop' },
    { name: 'Highest Rated', code: 'rating' },
  ]

  let wrapper,
    SortButton,
    title,
    selectedSort = '',
    drawerProps,
    sortProps,
    onClickHandler,
    mockMediaQuery = jest.fn()

  afterEach(() => {
    wrapper.unmount()
    jest.restoreAllMocks()
    title = undefined
    selectedSort = ''
    drawerProps = undefined
    sortProps = undefined
    onClickHandler = undefined
  })

  beforeEach(() => {
    jest.isolateModules(() => {
      jest.mock('@material-ui/core/useMediaQuery', () => mockMediaQuery)

      SortButton = require('react-storefront/plp/SortButton').default
    })
  })

  const Test = () => (
    <SearchResultsContext.Provider
      value={{
        pageData: { sort: selectedSort, sortOptions: sortOptions },
        actions: { setSort: jest.fn() },
      }}
    >
      <SortButton
        title={title}
        drawerProps={{ testprops: drawerProps }}
        sortProps={{ testprops: sortProps }}
        onClick={onClickHandler}
      />
    </SearchResultsContext.Provider>
  )

  it('should show sort as a drawer when mediaQuery returns true', () => {
    mockMediaQuery.mockReturnValue(true)

    wrapper = mount(<Test />)

    expect(wrapper.find(Drawer)).toExist()
    expect(wrapper.find(Menu)).not.toExist()
  })

  it('should show sort as a menu when mediaQuery returns false', () => {
    mockMediaQuery.mockReturnValue(false)

    wrapper = mount(<Test />)

    expect(wrapper.find(Drawer)).not.toExist()
    expect(wrapper.find(Menu)).toExist()
  })

  it('should open drawer and mount Sort component on button click', () => {
    mockMediaQuery.mockReturnValue(true)
    title = 'drawerTest'

    wrapper = mount(<Test />)
    expect(wrapper.find(Sort)).not.toExist()

    wrapper.find(ActionButton).simulate('click')

    expect(wrapper.find(Sort)).toExist()
    expect(wrapper.find(Drawer).prop('open')).toBe(true)
  })

  it('should pass drawerProps and title to drawer and sortProps to Sort', () => {
    mockMediaQuery.mockReturnValue(true)
    title = 'drawerTestTitle'
    drawerProps = 'drawerTestProps'
    sortProps = 'sortTestProps'

    wrapper = mount(<Test />)
    wrapper.find(ActionButton).simulate('click')

    expect(wrapper.find(Drawer).prop('title')).toBe(title)
    expect(wrapper.find(Drawer).prop('testprops')).toBe(drawerProps)
    expect(wrapper.find(Sort).prop('testprops')).toBe(sortProps)
  })

  it('should pass sortProps to Sort when SortButton is used as Menu', () => {
    mockMediaQuery.mockReturnValue(false)
    sortProps = 'sortTestProps'

    wrapper = mount(<Test />)

    wrapper.find(ActionButton).simulate('click')

    expect(wrapper.find(Menu)).toExist()
    expect(wrapper.find(Sort).prop('testprops')).toBe(sortProps)
  })

  it('should trigger custom onClick function when passed as prop', () => {
    mockMediaQuery.mockReturnValue(true)
    onClickHandler = jest.fn()

    wrapper = mount(<Test />)

    expect(onClickHandler).toHaveBeenCalledTimes(0)
    wrapper.find(ActionButton).simulate('click')
    expect(onClickHandler).toHaveBeenCalledTimes(1)
  })

  it('should not open Sort when defaultPrevented', () => {
    mockMediaQuery.mockReturnValue(true)
    onClickHandler = e => e.preventDefault()

    wrapper = mount(<Test />)

    expect(wrapper.find(Drawer).prop('open')).toBe(false)
    wrapper.find(ActionButton).simulate('click')
    expect(wrapper.find(Drawer).prop('open')).toBe(false)
  })

  it('should close Drawer', async () => {
    mockMediaQuery.mockReturnValue(true)

    wrapper = mount(<Test />)

    wrapper.find(ActionButton).simulate('click')
    expect(wrapper.find(Drawer).prop('open')).toBe(true)

    await act(async () => {
      await wrapper.find(Drawer).invoke('onClose')()
      await wrapper.update()
    })

    expect(wrapper.find(Drawer).prop('open')).toBe(false)
  })

  it('should close Menu', async () => {
    mockMediaQuery.mockReturnValue(false)

    wrapper = mount(<Test />)

    wrapper.find(ActionButton).simulate('click')
    expect(wrapper.find(Menu).prop('open')).toBe(true)

    await act(async () => {
      await wrapper.find(Menu).invoke('onClose')()
      await wrapper.update()
    })

    expect(wrapper.find(Menu).prop('open')).toBe(false)
  })

  it('should show selected sort name', async () => {
    selectedSort = 'rating'
    mockMediaQuery.mockReturnValue(false)

    wrapper = mount(<Test />)

    expect(wrapper.find(ActionButton).prop('value')).toBe('Highest Rated')
  })

  it('should open sort if location have openSort', async () => {
    mockMediaQuery.mockReturnValue(true)
    jest.spyOn(global.window, 'location', 'get').mockReturnValue({ search: '?openSort=1' })

    wrapper = mount(<Test />)

    expect(wrapper.find(Drawer).prop('open')).toBe(true)
  })
})