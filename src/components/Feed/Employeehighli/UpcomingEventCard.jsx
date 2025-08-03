import { Avatar, Typography } from "antd";

const { Text } = Typography;
function UpcomingEventCard() {
    return (
        <>
            <div className="!max-w-lg upcoming-birthday-card flex flex-col gap-3 xl:gap-4 items-center py-[10px] px-2 xl:px-[10px]  rounded-lg shadow-md border border-border-color">
                <Avatar
                    size={45}
                    icon={
                        <img
                            className="avatar-image h-full w-full object-cover rounded-full"
                            src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            alt=""
                        />
                    }
                />
                <div className="flex flex-col">
                    <Text className="text-primary-text font-inter font-semibold">John Doe</Text>
                    <Text className="text-primary-text font-inter font-semibold">15 June</Text>
                </div>
            </div>
        </>
    );
}

export default UpcomingEventCard;
