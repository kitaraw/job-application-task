// ============================================================================
//                           Таблица пользователей
// ============================================================================
import { StyledTableRow, StyledTableCell } from ".";

import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
} from "@mui/material";

import UserRow from "./UserRow";

export default function UserTable({
  users,
  currentUser,
  onTogglePermission,
  onSaveUser,
  editableRoles,
  canDeleteUsers,
  onDeleteUser
}) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center">id</StyledTableCell>
            <StyledTableCell align="center">Логин</StyledTableCell>
            <StyledTableCell align="center">Имя</StyledTableCell>
            <StyledTableCell align="center">Фамилия</StyledTableCell>
            <StyledTableCell align="center">Email</StyledTableCell>
            <StyledTableCell align="center">Роль</StyledTableCell>
            <StyledTableCell align="center">Права</StyledTableCell>
            <StyledTableCell align="center">Действия</StyledTableCell>
          </StyledTableRow>
        </TableHead>

        <TableBody>
          {users.map((u) => (
            <UserRow
              key={u.id}
              userData={u}
              currentUser={currentUser}
              onTogglePermission={onTogglePermission}
              onSaveUser={onSaveUser}
              editableRoles={editableRoles}
              canDeleteUsers={canDeleteUsers}
              onDeleteUser={onDeleteUser}
              
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
