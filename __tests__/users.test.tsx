import React from 'react'
import { render } from '@testing-library/react'
import Surveys from '@/app/(oauth)/(with-header)/(with-primary-left-menu)/users/page'

jest.mock('@/app/(oauth)/(with-header)/(with-primary-left-menu)/users/page', () => jest.fn(() => <div>Admin Page Content</div>));


describe('Surveys', () => {


  it('should have render', () => {
    render(<Surveys />)
  })
})