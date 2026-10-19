# Database Schema

## Sheet: Requests
| Column | Type | Notes |
|---|---|---|
| WorkOrderID | string | `WO-YYYYMMDD-####` |
| Timestamp | datetime | auto |
| RequesterEmail | string | from Session |
| RequesterName | string | |
| Department | string | |
| EquipmentName | string | |
| Location | string | |
| Category | enum | Breakdown/Preventive/Electrical/Mechanical/HVAC/General |
| Priority | enum | Low/Medium/High/Critical |
| Description | text | |
| Status | enum | Open/Assigned/In Progress/Completed |
| AssignedTechnician | string | email |
| StartTime | datetime | |
| CompletionTime | datetime | |
| ActionTaken | text | |
| Remarks | text | |
| BeforePhotoURL | url | Drive |
| AfterPhotoURL | url | Drive |
| Shift | enum | Morning/Afternoon/Night |
| DueDate | datetime | derived from priority |

## Sheet: Users
`Email | Name | Role | Department | Active`

## Sheet: Equipment
`EquipmentID | Name | Location | Department | Category | Status`

## Sheet: AuditLog
`Timestamp | User | Action | WorkOrderID | Details`
