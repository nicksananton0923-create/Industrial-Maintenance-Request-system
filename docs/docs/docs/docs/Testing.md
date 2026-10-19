# Testing Plan

## Manual test cases
| # | Scenario | Expected |
|---|---|---|
| 1 | Submit request with all fields | Row appended, WO ID returned |
| 2 | Submit without description | Error thrown |
| 3 | Requester opens Work Orders | Sees only own requests |
| 4 | Technician opens Work Orders | Sees only assigned |
| 5 | Supervisor assigns tech | Status = Assigned |
| 6 | Tech starts job | Status = In Progress, StartTime set |
| 7 | Tech completes job | Status = Completed, CompletionTime set |
| 8 | Overdue detection | Dashboard `overdue` > 0 |
| 9 | Photo upload | File appears in Drive folder |
| 10 | Audit log | Every action logged |

## Automated (future)
Use `clasp` + Node to run unit tests against `Code.gs` with mocked `SpreadsheetApp`.
