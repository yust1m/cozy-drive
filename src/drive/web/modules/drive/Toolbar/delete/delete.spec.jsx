import React from 'react'
import AppLike from 'test/components/AppLike'
import { mount } from 'enzyme'
import CozyClient from 'cozy-client'
import configureStore from 'drive/store/configureStore'
import { EnhancedDeleteConfirm } from './delete'
import DeleteConfirm from '../../DeleteConfirm'

describe('EnhancedDeleteConfirm', () => {
  const setup = () => {
    const folder = {
      _id: 'folder-id',
      name: 'My folder',
      dir_id: 'parent-folder-id'
    }
    const client = new CozyClient({})
    const store = configureStore({
      client
    })
    const mockSharingContext = {
      hasWriteAccess: () => true,
      getRecipients: () => [],
      getSharingLink: () => null
    }
    const router = {
      push: jest.fn()
    }
    const root = mount(
      <AppLike
        client={client}
        store={store}
        sharingContextValue={mockSharingContext}
      >
        <EnhancedDeleteConfirm folder={folder} router={router} />
      </AppLike>
    )
    return { root, folder, client, router }
  }

  it('should trashFiles on confirmation', async () => {
    const { root, router } = setup()
    const confirmProps = root.find(DeleteConfirm).props()
    await confirmProps.afterConfirmation()
    expect(router.push).toHaveBeenCalledWith('/folder/parent-folder-id')
  })
})
