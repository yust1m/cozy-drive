import CozyClient, { Q } from 'cozy-client'
import { TRASH_DIR_ID } from 'drive/constants/config'

const DEFAULT_CACHE_TIMEOUT_QUERIES = 30 * 60 * 1000
const defaultFetchPolicy = CozyClient.fetchPolicies.olderThan(
  DEFAULT_CACHE_TIMEOUT_QUERIES
)

export const parseFolderQueryId = maybeFolderQueryId => {
  const splitted = maybeFolderQueryId.split(' ')
  if (splitted.length !== 4) {
    return null
  }
  return {
    type: splitted[0],
    folderId: splitted[1],
    sortAttribute: splitted[2],
    sortOrder: splitted[3]
  }
}

export const formatFolderQueryId = (
  type,
  folderId,
  sortAttribute,
  sortOrder
) => {
  return `${type} ${folderId} ${sortAttribute} ${sortOrder}`
}

const buildDriveQuery = ({
  currentFolderId,
  type,
  sortAttribute,
  sortOrder
}) => ({
  definition: () =>
    Q('io.cozy.files')
      .where({
        dir_id: currentFolderId,
        _id: { $ne: TRASH_DIR_ID },
        type,
        [sortAttribute]: { $gt: null }
      })
      .indexFields(['dir_id', 'type', sortAttribute])
      .sortBy([
        { dir_id: sortOrder },
        { type: sortOrder },
        { [sortAttribute]: sortOrder }
      ])
      .limitBy(100),
  options: {
    as: formatFolderQueryId(type, currentFolderId, sortAttribute, sortOrder),
    fetchPolicy: defaultFetchPolicy
  }
})

const buildRecentQuery = () => ({
  definition: () =>
    Q('io.cozy.files')
      .where({
        trashed: false,
        type: 'file',
        updated_at: { $gt: null }
      })
      .indexFields(['updated_at', 'type', 'trashed'])
      .sortBy([{ updated_at: 'desc' }])
      .limitBy(100),
  options: {
    as: 'recent-view-query',
    fetchPolicy: defaultFetchPolicy
  }
})

const buildParentsByIdsQuery = ids => ({
  definition: () => Q('io.cozy.files').getByIds(ids),
  options: {
    as: `parents-by-ids-${ids.join('')}`,
    fetchPolicy: defaultFetchPolicy
  }
})

const buildSharingsQuery = ids => ({
  definition: () =>
    Q('io.cozy.files')
      .getByIds(ids)
      .sortBy([{ type: 'asc' }, { name: 'asc' }]),
  options: {
    as: `sharings-by-ids-${ids.join('')}`,
    fetchPolicy: defaultFetchPolicy
  }
})

const buildTrashQueryFolder = ({
  currentFolderId,
  sortAttribute,
  sortOrder,
  type
}) => ({
  definition: () =>
    Q('io.cozy.files')
      .where({
        dir_id: currentFolderId,
        type,
        [sortAttribute]: { $gt: null }
      })
      .indexFields(['dir_id', 'type', sortAttribute])
      .sortBy([
        { dir_id: sortOrder },
        { type: sortOrder },
        { [sortAttribute]: sortOrder }
      ]),
  options: {
    as: `trash-${formatFolderQueryId(
      type,
      currentFolderId,
      sortAttribute,
      sortOrder
    )}`,
    fetchPolicy: CozyClient.fetchPolicies.olderThan(
      DEFAULT_CACHE_TIMEOUT_QUERIES
    )
  }
})
/**
 * Get the query for folder if given the query for files
 * and vice versa.
 *
 * If given the queryId `directory id123 name desc`, will return
 * the query `files id123 name desc`.
 */
export const getMirrorQueryId = queryId => {
  const { type, folderId, sortAttribute, sortOrder } = parseFolderQueryId(
    queryId
  )
  const otherType = type === 'directory' ? 'file' : 'directory'
  const otherQueryId = formatFolderQueryId(
    otherType,
    folderId,
    sortAttribute,
    sortOrder
  )
  return otherQueryId
}

export const buildFolderQuery = folderId => ({
  definition: () =>
    Q('io.cozy.files')
      .getById(folderId)
      .include(['parent']),
  options: {
    as: 'folder-' + folderId,
    fetchPolicy: defaultFetchPolicy
  }
})

export {
  buildDriveQuery,
  buildRecentQuery,
  buildParentsByIdsQuery,
  buildSharingsQuery,
  buildTrashQueryFolder
}
