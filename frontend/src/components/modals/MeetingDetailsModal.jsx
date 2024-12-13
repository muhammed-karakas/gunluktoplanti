import React from 'react';
import { Button, Col, Divider, Modal, Row, Typography } from 'antd';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const MeetingDetailsModal = ({ visible, onClose, meeting }) => {
    if (!meeting) {
        return null;
    }

    return (
        <Modal
            title='Toplantı Detayları'
            centered
            width='75vw'
            open={visible}
            onCancel={onClose}
            footer={
                <Button key='close' onClick={onClose}>
                    Kapat
                </Button>
            }
        >
            <Row gutter={32}>
                <Col span={12}>
                    <Title level={5}>Konu</Title>
                    <Text>{meeting.topic}</Text>
                    <Divider />
                    <Title level={5}>Yer</Title>
                    <Text>{meeting.location}</Text>
                    <Divider />
                    <Title level={5}>Tarih ve Saat</Title>
                    <Text>{dayjs(meeting.meetingDatetime).format('DD.MM.YYYY HH:mm')}</Text>
                    <Divider />
                    <Title level={5}>Süre</Title>
                    <Text>{meeting.duration} dakika</Text>
                    <Divider />
                    <Title level={5}>Şirketler</Title>
                    <Text>{meeting.companies.join(', ')}</Text>
                    <Divider />
                </Col>
                <Col span={12}>
                    <Title level={5}>Şirket Katılımcıları</Title>
                    <Text>{meeting.companyParticipants.join(', ')}</Text>
                    <Divider />
                    <Title level={5}>Departmanlar</Title>
                    <Text>{meeting.departments.join(', ')}</Text>
                    <Divider />
                    <Title level={5}>Departman Katılımcıları</Title>
                    <Text>{meeting.departmentParticipants.join(', ')}</Text>
                    <Divider />
                    <Title level={5}>Onay Makamları</Title>
                    <Text>{meeting.approvalAuthorities.join(', ')}</Text>
                    <Divider />
                    <Title level={5}>Onay Tarihi</Title>
                    <Text>{dayjs(meeting.approvalDatetime).format('DD.MM.YYYY HH:mm')}</Text>
                </Col>
            </Row>
        </Modal>
    );
};

export default MeetingDetailsModal;
