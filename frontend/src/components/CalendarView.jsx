import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Badge, Button, Calendar, ConfigProvider, message, Modal, Select, Space, Spin, Typography } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import meetingService from '../api/meetingService';
import MeetingDetailsModal from './modals/MeetingDetailsModal';
import tr from 'antd/lib/locale/tr_TR';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const CalendarView = ({ onDateChange, onRefetchMeetings }) => {
    const [viewMode, setViewMode] = useState('month');
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [meetings, setMeetings] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [modalData, setModalData] = useState([]);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const calendarContainerRef = useRef(null);

    const fetchMeetings = useCallback(async () => {
        setLoading(true);
        try {
            const year = currentDate.year();
            if (viewMode === 'year') {
                const response = await meetingService.getMeetingsByYear(year);
                setMeetings(response.data);
            } else if (viewMode === 'month') {
                const response = await meetingService.getMeetingsByMonth(year, currentDate.month());
                setMeetings(response.data);
            }
        } catch (error) {
            message.error('Toplantılar alınırken bir hata oluştu.');
            console.error('Toplantılar alınırken bir hata oluştu:', error);
        } finally {
            setLoading(false);
        }
    }, [currentDate, viewMode]);

    useEffect(() => {
        if (onRefetchMeetings) {
            onRefetchMeetings(fetchMeetings);
        }
    }, []);

    useEffect(() => {
        if (onDateChange) {
            onDateChange(currentDate.year(), currentDate.month());
        }
    }, [currentDate, viewMode, onDateChange]);

    useEffect(() => {
        fetchMeetings();
    }, [currentDate, viewMode, fetchMeetings]);

    const getListData = (value) => {
        return meetings.filter((meeting) => {
            const meetingDate = dayjs(meeting.meetingDatetime);
            return meetingDate.isSame(value, 'date');
        });
    };

    const handleMeetingClick = (meeting) => {
        setSelectedMeeting(meeting);
        setDetailsModalVisible(true);
    };

    const cellRender = (date, info) => {
        if (viewMode === 'month' && info.type === 'date') {
            const listData = getListData(date);
            const maxDisplay = 6;
            return (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {listData.slice(0, maxDisplay - 1).map((item) => (
                        <li
                            key={item.id}
                            style={{ height: '22px', cursor: 'pointer', borderRadius: '8px', transition: 'background-color 0.2s' }}
                            onClick={() => handleMeetingClick(item)}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                            <Badge style={{ whiteSpace: 'nowrap' }} status='processing' text={item.topic} />
                        </li>
                    ))}
                    {listData.length > maxDisplay && (
                        <li style={{ height: '22px', textAlign: 'center', fontSize: '18px', color: '#1677ff', }}>
                            <MoreOutlined />
                        </li>
                    )}
                </ul>
            );
        }
        if (viewMode === 'year' && info.type === 'month') {
            const monthMeetings = meetings.filter((meeting) => {
                const meetingDate = dayjs(meeting.meetingDatetime);
                return meetingDate.year() === date.year() && meetingDate.month() === date.month();
            });
            return monthMeetings.length > 0 ? (
                <Badge color={'blue'} count={`${monthMeetings.length} Toplantı`} style={{ fontSize: '14px' }} />
            ) : <Badge color={'blue'} count={monthMeetings.length} />;
        }
        return info.originNode;
    };

    const adjustCalendarHeight = () => {
        const container = calendarContainerRef.current;
        if (container) {
            const calendarBody = document.querySelector('.ant-picker-body');
            if (calendarBody) {
                const rows = viewMode === 'month' ? 7 : 5;
                const containerHeight = container.clientHeight;
                const defaultRowHeight = Math.floor(containerHeight / rows);
                const maxVisibleMeetings = 6;
                const calculatedHeight = viewMode === 'month' ?
                    Math.max(defaultRowHeight, 32 + meetings.reduce((max, meeting) => {
                        const meetingDate = dayjs(meeting.meetingDatetime);
                        if (meetingDate.month() === currentDate.month()) {
                            const dayCount = meetings.filter((m) =>
                                dayjs(m.meetingDatetime).isSame(meetingDate, 'date')).length;
                            return Math.max(max, Math.min(dayCount, maxVisibleMeetings));
                        }
                        return max;
                    }, 0) * 22) : defaultRowHeight;
                const cells = document.querySelectorAll('.ant-picker-cell-inner, .ant-picker-calendar-date-content');
                cells.forEach((cell) => {
                    cell.style.height = `${calculatedHeight}px`;
                });
            }
        }
    };

    useEffect(() => {
        adjustCalendarHeight();
        window.addEventListener('resize', adjustCalendarHeight);
        return () => window.removeEventListener('resize', adjustCalendarHeight);
    }, [meetings, currentDate, viewMode]);

    const openModal = (date) => {
        const listData = getListData(date);
        setSelectedDate(date.format('DD.MM.YYYY'));
        setModalData(listData);
        setModalVisible(true);
    };

    const handleYearChange = (year) => {
        setCurrentDate(currentDate.year(year));
    };

    const handleMonthChange = (month) => {
        setCurrentDate(currentDate.month(month));
    };

    const generateYearOptions = () => {
        const currentYear = currentDate.year();
        const startYear = currentYear - 10;
        const endYear = currentYear + 10;
        return Array.from({ length: endYear - startYear + 1 }, (_, i) => ({
            value: startYear + i,
            label: (startYear + i).toString(),
        }));
    };

    const generateMonthOptions = () => {
        return Array.from({ length: 12 }, (_, i) => ({
            value: i,
            label: dayjs().month(i).format('MMMM'),
        }));
    };

    return (
        <ConfigProvider locale={tr}>
            <div ref={calendarContainerRef} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Space style={{ marginBottom: 16 }}>
                    <Button type='primary' onClick={() => setViewMode('year')} disabled={viewMode === 'year'}>
                        Yıl Modu
                    </Button>
                    <Button type='primary' onClick={() => setViewMode('month')} disabled={viewMode === 'month'}>
                        Ay Modu
                    </Button>
                    <Select
                        style={{ width: 100 }}
                        value={currentDate.year()}
                        options={generateYearOptions()}
                        onChange={handleYearChange}
                    />
                    {viewMode === 'month' && (
                        <Select
                            style={{ width: 120 }}
                            value={currentDate.month()}
                            options={generateMonthOptions()}
                            onChange={handleMonthChange}
                        />
                    )}
                </Space>
                <Spin spinning={loading}>
                    <Calendar
                        value={currentDate}
                        onSelect={(date) => {
                            if (viewMode === 'month') {
                                if (date.isSame(currentDate, 'month')) {
                                    openModal(date);
                                } else {
                                    setCurrentDate(date.startOf('month'));
                                }
                            } else {
                                setCurrentDate(date.startOf('month'));
                                setViewMode('month');
                            }
                        }}
                        mode={viewMode}
                        cellRender={cellRender}
                        headerRender={() => null}
                    />
                </Spin>
                <Modal
                    title={`Toplantılar (${selectedDate})`}
                    centered
                    width='50vw'
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    footer={
                        <Button key='close' onClick={() => setModalVisible(false)}>
                            Kapat
                        </Button>
                    }
                >
                    {modalData.length ? (
                        <ul>
                            {modalData.map((item) => (
                                <li
                                    key={item.id}
                                    style={{ cursor: 'pointer', borderRadius: '8px', transition: 'background-color 0.2s' }}
                                    onClick={() => handleMeetingClick(item)}
                                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                    <Typography.Text>{item.topic}</Typography.Text> -{' '}
                                    <Typography.Text>{item.location}</Typography.Text>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Typography.Text>Bu tarihte toplantı bulunmamaktadır.</Typography.Text>
                    )}
                </Modal>
                <MeetingDetailsModal
                    visible={detailsModalVisible}
                    onClose={() => {
                        setDetailsModalVisible(false);
                        setModalVisible(false);
                    }}
                    meeting={selectedMeeting}
                />
            </div>
        </ConfigProvider>
    );
};

export default CalendarView;
