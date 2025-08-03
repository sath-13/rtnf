import { axiosSecureInstance } from "./axios";

export const sendEmailWithAttachment = async (filteredUsers, csvData, recipientEmail) => {
  try {
    const emailData = {
      recipients: filteredUsers, // Send the filtered users' emails
      subject: 'Filtered Users List with Badges',
      body: 'Please find the attached CSV file with the filtered users list and their badges.',
      csvData: csvData, // Send CSV as string
    };

    const response = await axiosSecureInstance.post('api/email/send-email', emailData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data; 
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

  