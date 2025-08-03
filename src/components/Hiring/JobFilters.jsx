import { Input, Select } from "antd";
import './styles.css';
const { Option } = Select;

const JobFilters = ({ teams, branches, onBranchChange, onTeamChange, onSearch }) => (
  <div className="flex flex-wrap gap-2 lg:gap-4 mb-6 mt-4">
    <Select
      placeholder="Select Location"
      className="w-full lg:!w-[180px] "
      onChange={onBranchChange}
      allowClear
    >
      {branches.map((branch) => (
        <Option key={branch} value={branch}>
          {branch}
        </Option>
      ))}
    </Select>

    <Select
      placeholder="Select Pod"
      className="w-full lg:!w-[180px] "
      onChange={onTeamChange}
      allowClear
    >
      {teams?.map((team) => (
        <Option key={team._id} value={team.teamTitle}>
          {team.teamTitle}
        </Option>
      ))}
    </Select>

    <Input
      className="input-search w-full lg:w-60 rounded-md border-gray-300 shadow-sm p-2"
      placeholder="Search by role"
      onChange={e => onSearch(e.target.value)}
    />
  </div>
);

export default JobFilters;
