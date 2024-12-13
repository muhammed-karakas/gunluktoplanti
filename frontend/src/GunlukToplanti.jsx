import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, Typography } from 'antd';
import { AutoCompleteProvider } from './components/AutoCompleteManager';
import CalendarView from './components/CalendarView';
import FilterMeetingsModal from './components/modals/FilterMeetingsModal';
import MeetingFormModal from './components/modals/MeetingFormModal';
import dayjs from 'dayjs';

const GunlukToplanti = () => {
    const [headerFooterHeight, setHeaderFooterHeight] = useState(Math.max(window.innerHeight * 0.1, 32));
    const [isMeetingModalVisible, setIsMeetingModalVisible] = useState(false);
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [currentYear, setCurrentYear] = useState(dayjs().year());
    const [currentMonth, setCurrentMonth] = useState(dayjs().month());
    const [refetchMeetings, setRefetchMeetings] = useState(null);
    const contentRef = useRef(null);

    const updateHeights = () => {
        setHeaderFooterHeight(Math.max(window.innerHeight * 0.1, 32));
    };

    useEffect(() => {
        updateHeights();
        window.addEventListener('resize', updateHeights);
        return () => {
            window.removeEventListener('resize', updateHeights);
        };
    }, []);

    return (
        <AutoCompleteProvider>
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div
                    style={{
                        backgroundColor: '#005',
                        color: 'white',
                        height: headerFooterHeight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 32px',
                    }}
                >
                    <Typography.Title level={3} style={{ color: 'white', margin: 0 }}>
                        Günlük Toplantı Sistemi
                    </Typography.Title>
                    <Space>
                        <Button onClick={() => setIsMeetingModalVisible(true)}>Yeni Toplantı</Button>
                        <Button onClick={() => setIsFilterModalVisible(true)}>Toplantıları Filtrele</Button>
                    </Space>
                </div>
                <div
                    ref={contentRef}
                    style={{
                        flexGrow: 1,
                        overflow: 'auto',
                        height: `calc(100vh - ${headerFooterHeight * 2}px)`,
                        padding: '16px',
                    }}
                >
                    <CalendarView
                        onDateChange={(year, month) => {
                            setCurrentYear(year);
                            setCurrentMonth(month);
                        }}
                        onRefetchMeetings={(fn) => {
                            setRefetchMeetings(() => fn);
                        }}
                    />
                </div>
                <div
                    style={{
                        backgroundColor: '#005',
                        color: 'white',
                        height: headerFooterHeight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    Günlük Toplantı Sistemi ©2024
                </div>
                <MeetingFormModal
                    visible={isMeetingModalVisible}
                    onClose={() => setIsMeetingModalVisible(false)}
                    currentYear={currentYear}
                    currentMonth={currentMonth}
                    refetchMeetings={refetchMeetings}
                />
                <FilterMeetingsModal
                    visible={isFilterModalVisible}
                    onClose={() => setIsFilterModalVisible(false)}
                />
            </div>
        </AutoCompleteProvider>
    );
};

export default GunlukToplanti;
