import React from 'react'
import { connect } from 'react-redux'

import FileList from 'drive/web/modules/filelist/FileList'
import SelectionBar from 'drive/web/modules/selection/SelectionBar'
import { mapStateToProps, mapDispatchToProps } from './Actions'

const LightFileList = ({
  actions,
  onFileOpen,
  onFolderOpen,
  fileListProps
}) => (
  <>
    <SelectionBar actions={actions} />
    <FileList
      onFileOpen={onFileOpen}
      onFolderOpen={onFolderOpen}
      withSelectionCheckbox={true}
      fileActions={actions}
      {...fileListProps}
    />
  </>
)

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LightFileList)