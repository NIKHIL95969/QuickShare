export interface ContentItem {
  _id: string
  content: string
  title?: string
  description?: string
  tags: string[]
  isPrivate: boolean
  isPasswordProtected: boolean
  fileType: string
  fileName?: string
  temp: boolean
  createdAt: string
  shareableLink?: string
  sharingType?: string
  sharedWithGroups?: Array<{
    groupId: string
    sharedAt: string
    sharedBy: string
  }>
}

export interface Group {
  _id: string
  name: string
  description?: string
  ownerId: string
  members: Array<{
    userId: string
    email: string
    role: 'owner' | 'admin' | 'member'
    invitedBy: string
  }>
  pendingInvitations: Array<{
    email: string
    invitedBy: string
    token: string
    expiresAt: Date
  }>
  createdAt: string
  updatedAt: string
}

export type DashboardView = 'overview' | 'content' | 'groups' | 'settings'

export interface NewContentState {
  content: string
  title: string
  description: string
  tags: string
  isPrivate: boolean
  isPasswordProtected: boolean
  password: string
  sharingType: string
  sharedWithGroups: string[]
}

export interface NewGroupState {
  name: string
  description: string
  memberEmails: string
}