import { styled } from "@mui/material/styles";
import { TextField, Select, Button } from "@mui/material"; // Import MUI components for styling

// Modal container style
const ModalContainer = styled("div")(({ theme }) => ({
  padding: theme.spacing(3),
  width: 600,
  margin: "auto",
}));

// Styled TextField for the input area
const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: "100%", // Ensures it takes up the full width
}));

// Styled Select for the feedback type
const StyledSelect = styled(Select)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: "100%", // Ensures it takes up the full width
}));

// Styled Button for submission
const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  width: "100%", // Ensures it takes up the full width
}));

export { ModalContainer, StyledTextField, StyledSelect, SubmitButton };
