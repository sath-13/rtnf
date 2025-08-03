import { Button, Input, Form, notification, Space } from "antd";
import "../Users/UserAddition/UserAdditionForm";
import { createSubStream } from "../../../api/substreamsapi";
import { StreamMessages } from "../../../constants/constants";
import { useParams } from "react-router-dom";
import { toastError, toastSuccess } from "../../../Utility/toast";

const SubStreamAdditionForm = ({ onClose, streamTitle }) => {
    const { workspacename } = useParams();
    const [form] = Form.useForm();
    const handleSubmit = async (values) => {
        try {
            await createSubStream({ ...values, streamTitle: streamTitle, workspacename });
            // notification.success({
            //     message: StreamMessages.SUBSTREAM_ADD_MSG,
            //     description: StreamMessages.SUBSTREAM_ADD_SUCC,
            //     duration: 2,
            // });
            toastSuccess({ title: StreamMessages.SUBSTREAM_ADD_MSG, description: StreamMessages.SUBSTREAM_ADD_SUCC });
            form.resetFields();
            onClose();
        } catch (error) {
            // notification.error({
            //     message: StreamMessages.SUBSTREAM_ERR_MSG,
            //     description: error.response?.data?.message || StreamMessages.SUBSTREAM_ADD_ERR,
            // });
            toastError({ title: StreamMessages.SUBSTREAM_ERR_MSG, description: error.response?.data?.message || StreamMessages.SUBSTREAM_ADD_ERR });
            console.error(error);
        }
    };

    const handleClose = () => {
        form.resetFields(); // Reset the form fields when closing
        onClose();
    };


    return (
        <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item label="Sub Stream Title" name="subStreamTitle" rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="Enter Sub Stream name" />
            </Form.Item>

            <Form.Item label="Description" name="description" rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="Enter Sub Strem Desciption" />
            </Form.Item>

            <Form.Item label="Stream Name">
                <Input value={streamTitle} disabled className="font-bold text-black" />
            </Form.Item>

            <Space>
                <Button className="custom-button" type="primary" htmlType="submit">
                    Add Sub Stream
                </Button>
                <Button onClick={handleClose} type="default">
                    Cancel
                </Button>
            </Space>
        </Form>
    );
};

export default SubStreamAdditionForm;