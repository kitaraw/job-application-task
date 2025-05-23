import React, { useState, useEffect, useRef,useCallback } from "react";
import {
  Container,
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Tooltip,
} from "@mui/material";

function CommandRunner({ isOpen }) {
  const [ws, setWs] = useState(null);
  const [log, setLog] = useState("");
  const [numUsers, setNumUsers] = useState("");
  const [numAccess, setNumAccess] = useState("");
  const logRef = useRef(null);
  const reconnectRef = useRef(null);

  const connectWebSocket = useCallback(() => {
    const socket = new WebSocket("ws://localhost:8000/ws/commands/");

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "stdout") {
        setLog((prev) => prev + data.message);
      } else if (data.type === "finished") {
        setLog(
          (prev) =>
            prev + `\n=== Process finished with code ${data.return_code} ===\n`
        );
      }
    };

    socket.onclose = (e) => {
      console.log("WebSocket closed. Reason:", e.reason || "no reason");
      reconnectRef.current = setTimeout(() => {
        console.log("Attempting to reconnect...");
        connectWebSocket();
      }, 1000);
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      socket.close();
    };

    setWs(socket);
  }, []); 

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [connectWebSocket]);// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);



  const startCommand = (command) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not ready");
      return;
    }
    ws.send(
      JSON.stringify({
        action: "start_command",
        command: command,
      })
    );
  };


  const cancelCommand = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not ready");
      return;
    }
    ws.send(
      JSON.stringify({
        action: "cancel_command",
      })
    );
  };

  const styleHidden = { display: isOpen ? "block" : "none" };

  return (
    <Box sx={{ mt: 2, ...styleHidden }}>
      <Stack direction="row" sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
        {[
          { command: "makemigrations", description: "Создает миграции" },
          { command: "migrate", description: "Применяет миграции" },
          {
            command:
              "initialize_test_data --yes --num_users=20 --num_access=30",
            description:
              "Инициализация тестовых данных лучше всего нажимать при первом запуске",
          },
          {
            command: "add_softs",
            description: "Добавляет 100 случайных пакетов",
          },
          {
            command: "delete_first_100_softs",
            description:
              "Удаляет первые 100 пакетов + все связи (доступы пользователей)",
          },
          { command: "delete_all_softs", description: "Удаляет все пакеты" },
          {
            command: "create_default_roles",
            description:
              "Создает 2 дефолтные роли admin и user у админа все права у user никаких",
          },
        ].map(({ command, description }) => (
          <Tooltip title={description} key={command}>
            <Button
              variant="contained"
              onClick={() => startCommand(command)}
              sx={{ textTransform: "none" }}
            >
              {command}
            </Button>
          </Tooltip>
        ))}
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Кол-во пользователей (по умолч. 50)"
          value={numUsers}
          onChange={(e) => setNumUsers(e.target.value)}
        />
        <Tooltip title="Добавить случайных пользователей">
          <Button
            sx={{ textTransform: "none" }}
            variant="contained"
            onClick={() =>
              startCommand(
                numUsers
                  ? `add_random_users ${numUsers}`
                  : `add_random_users 50`
              )
            }
          >
            add_random_users
          </Button>
        </Tooltip>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Кол-во доступов (по умолч. 50)"
          value={numAccess}
          onChange={(e) => setNumAccess(e.target.value)}
        />
        <Tooltip title="Добавить доступы к ПО">
          <Button
            sx={{ textTransform: "none" }}
            variant="contained"
            onClick={() =>
              startCommand(
                numAccess
                  ? `add_soft_access ${numAccess}`
                  : `add_soft_access 50`
              )
            }
          >
            add_soft_access
          </Button>
        </Tooltip>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Tooltip title="Отменить текущую команду">
          <Button variant="outlined" color="error" onClick={cancelCommand}>
            Отменить текущий процесс
          </Button>
        </Tooltip>
      </Stack>

      <TextField
        variant="outlined"
        multiline
        rows={10}
        value={log}
        fullWidth
        inputRef={logRef}
        InputProps={{ readOnly: true }}
        sx={{ mb: 2 }}
      />
    </Box>
  );
}

export default function CheatMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <Container sx={{ my: 10 }}>
      <Button variant="contained" fullWidth onClick={toggleMenu}>
        {menuOpen ? "Свернуть чит-меню" : "Развернуть чит-меню"}
      </Button>

      {menuOpen && (
        <>
          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            Cheat Menu
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Здесь можно запускать команды напрямую через WebSocket.
          </Typography>
        </>
      )}

      <CommandRunner isOpen={menuOpen} />
    </Container>
  );
}
