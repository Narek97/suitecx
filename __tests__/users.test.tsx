import React from 'react'
import { render } from '@testing-library/react'
import Surveys from '@/app/(oauth)/(with-header)/users/page'

jest.mock('@/app/(oauth)/(with-header)/users/page', () => jest.fn(() => <div>Admin Page Content</div>));


describe('Surveys', () => {


  it('should have render', () => {
    render(<Surveys />)
  })
})