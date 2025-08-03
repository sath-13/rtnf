import UpcomingEventCard from "./UpcomingEventCard"
import { Card, Typography, Image } from "antd";
const { Title, Text } = Typography;

function EmployeeHighlightsTabs({ title, imgSrc }) {
    return (
        <section className=" py-0 md:py-[18px] hide-scrollbar">
            <div className="mb-5 rounded-xl px-0 xl:px-2 py-0 xl:py-5 bg-[#ffffff] flex flex-col gap-[10px]">
                {/* first div */}
                <Card>
                    <h1 className="!text-lg md:!text-xl text-primary-text font-rubik font-semibold">{title} today</h1>
                    <div className="birthday-card flex flex-col items-center gap-[10px] p-[10px] rounded-lg">
                        <Image
                            preview={false}
                            width={100}
                            src={imgSrc}
                            alt="image of employee highlights"
                        />
                        <Text className="no-birthdays !mt-2 text-sm font-inter font-semibold text-secondary-text text-center">
                            No {title} today.
                        </Text>
                    </div>
                </Card>
                {/* second div */}
                <Card>
                    <h1 className="upcoming-birthdays-title font-rubik font-semibold text-primary-text !mb-[30px] !text-lg md:!text-xl">
                        Upcoming {title}
                    </h1>
                    <div>
                        <div className="birthday-card-container flex flex-col gap-3">
                            <UpcomingEventCard />
                            <UpcomingEventCard />
                        </div>
                    </div>
                </Card>
            </div>
        </section>
    );
}

export default EmployeeHighlightsTabs;
