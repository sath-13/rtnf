import { toast } from "react-toastify";
import ToastCard from "../components/ToastCard/ToastCard";
import { IoCheckmark } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { CiWarning } from "react-icons/ci";


const toastSuccess = ({ title, description }) => {
    toast(
        <ToastCard
            title={title}
            description={description}
            Icon={<IoCheckmark className="check-icon" />}
            type="success"
        />,
        {
            autoClose: 3000,
            closeButton: false,
            hideProgressBar: true,
            pauseOnHover: true,
            draggable: true,
        }
    );
};

const toastError = ({ title, description }) => {
    toast(
        <ToastCard
            title={title}
            description={description}
            type="error"
            Icon={<RxCross2 className="check-icon" />}
        />,
        {
            autoClose: 3000,
            closeButton: false,
            hideProgressBar: true,
            pauseOnHover: true,
            draggable: true,
        }
    );
};
const toastWarning = ({ title, description }) => {
    toast(
        <ToastCard
            title={title}
            description={description}
            type="warning"
            Icon={<CiWarning className="check-icon" />}
        />,
        {
            autoClose: 3000,
            closeButton: false,
            hideProgressBar: true,
            pauseOnHover: true,
            draggable: true,
        }
    );
};

export { toastSuccess, toastError, toastWarning };