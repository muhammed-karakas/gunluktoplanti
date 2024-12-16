import React, { useState } from 'react';
import { AutoComplete, Button, Col, ConfigProvider, DatePicker, Divider, Form, message, Modal, Row, Space, Table } from 'antd';
import { useAutoComplete } from '../AutoCompleteManager';
import meetingService from '../../api/meetingService';
import tr from 'antd/lib/locale/tr_TR';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const buildOptions = (arr) => {
    return [...new Set(arr)].map((item, idx) => ({
        value: item, label: item, key: item + idx
    }));
};

const FilterMeetingsModal = ({ visible, onClose }) => {
    const [form] = Form.useForm();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(false);
    const { topics, locations, companies, departments, approvalAuthorities, fetchDepartments } = useAutoComplete();
    const topicOptions = buildOptions(topics);
    const locationOptions = buildOptions(locations);
    const companyOptions = buildOptions(companies);
    const departmentOptions = buildOptions(departments);
    const approvalAuthoritiesOptions = buildOptions(approvalAuthorities);

    const columns = [
        {
            title: 'Konu', dataIndex: 'topic', key: 'topic', sorter: (a, b) => a.topic.localeCompare(b.topic),
            render: (text) => <div style={{ minWidth: '5ch', maxWidth: '50ch' }}>{text}</div>
        },
        {
            title: 'Yer', dataIndex: 'location', key: 'location', sorter: (a, b) => a.location.localeCompare(b.location),
            render: (text) => <div style={{ minWidth: '4ch', maxWidth: '50ch' }}>{text}</div>
        },
        {
            title: 'Tarih', dataIndex: 'meetingDatetime', key: 'meetingDatetime', sorter: (a, b) => new Date(a.meetingDatetime) - new Date(b.meetingDatetime),
            render: (date) => (<div style={{ minWidth: '6ch', maxWidth: '50ch' }}> {date ? dayjs(date).format('DD.MM.YYYY HH:mm') : ''} </div>)
        },
        {
            title: 'Süre (dk)', dataIndex: 'duration', key: 'duration', sorter: (a, b) => a.duration - b.duration,
            render: (text) => <div style={{ minWidth: '5ch', maxWidth: '50ch' }}>{text}</div>
        },
        {
            title: 'Şirketler', dataIndex: 'companies', key: 'companies', sorter: (a, b) => (Array.isArray(a.companies) ? a.companies.length : 0) - (Array.isArray(b.companies) ? b.companies.length : 0),
            render: (companies) => (<div style={{ minWidth: '10ch', maxWidth: '50ch' }}> {Array.isArray(companies) ? companies.join(', ') : companies} </div>)
        },
        {
            title: 'Şirket Katılımcıları', dataIndex: 'companyParticipants', key: 'companyParticipants', sorter: (a, b) => (Array.isArray(a.companyParticipants) ? a.companyParticipants.length : 0) - (Array.isArray(b.companyParticipants) ? b.companyParticipants.length : 0),
            render: (participants) => (<div style={{ minWidth: '14ch', maxWidth: '50ch' }}> {Array.isArray(participants) ? participants.join(', ') : participants} </div>)
        },
        {
            title: 'Departmanlar', dataIndex: 'departments', key: 'departments', sorter: (a, b) => (Array.isArray(a.departments) ? a.departments.length : 0) - (Array.isArray(b.departments) ? b.departments.length : 0),
            render: (depts) => (<div style={{ minWidth: '13ch', maxWidth: '50ch' }}> {Array.isArray(depts) ? depts.join(', ') : depts} </div>)
        },
        {
            title: 'Departman Katılımcıları', dataIndex: 'departmentParticipants', key: 'departmentParticipants', sorter: (a, b) => (Array.isArray(a.departmentParticipants) ? a.departmentParticipants.length : 0) - (Array.isArray(b.departmentParticipants) ? b.departmentParticipants.length : 0),
            render: (participants) => (<div style={{ minWidth: '14ch', maxWidth: '50ch' }}> {Array.isArray(participants) ? participants.join(', ') : participants} </div>)
        },
        {
            title: 'Onay Makamları', dataIndex: 'approvalAuthorities', key: 'approvalAuthorities', sorter: (a, b) => (Array.isArray(a.approvalAuthorities) ? a.approvalAuthorities.length : 0) - (Array.isArray(b.approvalAuthorities) ? b.approvalAuthorities.length : 0),
            render: (authorities) => (<div style={{ minWidth: '10ch', maxWidth: '50ch' }}> {Array.isArray(authorities) ? authorities.join(', ') : authorities} </div>)
        },
        {
            title: 'Onay Tarihi', dataIndex: 'approvalDatetime', key: 'approvalDatetime', sorter: (a, b) => new Date(a.approvalDatetime) - new Date(b.approvalDatetime),
            render: (date) => (<div style={{ minWidth: '7ch', maxWidth: '50ch' }}> {date ? dayjs(date).format('DD.MM.YYYY HH:mm') : ''} </div>)
        }
    ];

    const fetchMeetings = async (filters) => {
        setLoading(true);
        try {
            const response = await meetingService.getMeetings(filters);
            setMeetings(response.data);
        } catch (error) {
            console.error('Toplantılar alınırken bir hata oluştu:', error);
            message.error('Toplantılar alınırken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const buildFilters = () => {
        const values = form.getFieldsValue();
        let startDate = null;
        let endDate = null;
        if (values.dateRange && values.dateRange[0] && values.dateRange[1]) {
            startDate = dayjs(values.dateRange[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            endDate = dayjs(values.dateRange[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        }
        let approvalStartDate = null;
        let approvalEndDate = null;
        if (values.approvalDateRange && values.approvalDateRange[0] && values.approvalDateRange[1]) {
            approvalStartDate = dayjs(values.approvalDateRange[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            approvalEndDate = dayjs(values.approvalDateRange[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        }
        const filters = {
            topic: values.topic || null,
            location: values.location || null,
            startDate, endDate,
            company: values.company || null,
            department: values.department || null,
            approvalAuthority: values.approvalAuthority || null,
            approvalStartDate, approvalEndDate
        };
        return filters;
    };

    const onSubmit = async () => {
        const filters = buildFilters();
        await fetchMeetings(filters);
    };

    const handleExportToExcel = async () => {
        const filters = buildFilters();
        try {
            meetingService.exportToExcel(filters);
            message.success('Excel dosyası indiriliyor...');
        } catch (error) {
            console.error('Excel indirilirken bir hata oluştu:', error);
            message.error('Excel indirilirken bir hata oluştu.');
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setMeetings([]);
        setLoading(false);
        onClose();
    };

    return (
        <ConfigProvider locale={tr}>
            <Modal
                title='Toplantıları Filtrele'
                centered
                width='90vw'
                open={visible}
                onCancel={handleCancel}
                footer={null}
                destroyOnClose
            >
                <Form form={form} layout='vertical' onFinish={onSubmit} preserve={false}>
                    <Row gutter={32}>
                        <Col span={8}>
                            <Divider>Filtre</Divider>
                            <Form.Item name='topic' label='Konu'>
                                <AutoComplete
                                    options={topicOptions}
                                    placeholder='Konu seçin'
                                    allowClear
                                    filterOption={(inputValue, option) =>
                                        option?.value.toLowerCase().includes(inputValue.toLowerCase())
                                    }
                                />
                            </Form.Item>
                            <Form.Item name='location' label='Yer'>
                                <AutoComplete
                                    options={locationOptions}
                                    placeholder='Yer seçin'
                                    allowClear
                                    filterOption={(inputValue, option) =>
                                        option?.value.toLowerCase().includes(inputValue.toLowerCase())
                                    }
                                />
                            </Form.Item>
                            <Form.Item name='dateRange' label='Tarih Aralığı'>
                                <DatePicker.RangePicker format='DD.MM.YYYY' style={{ width: '100%' }} allowClear />
                            </Form.Item>
                            <Form.Item name='company' label='Şirket'>
                                <AutoComplete
                                    options={companyOptions}
                                    placeholder='Şirket seçin'
                                    allowClear
                                    filterOption={(inputValue, option) =>
                                        option?.value.toLowerCase().includes(inputValue.toLowerCase())
                                    }
                                />
                            </Form.Item>
                            <Form.Item name='department' label='Departman'>
                                <AutoComplete
                                    options={departmentOptions}
                                    placeholder='Departman seçin'
                                    allowClear
                                    onFocus={() => {
                                        const loc = form.getFieldValue('location');
                                        if (loc) {
                                            fetchDepartments([loc]);
                                        }
                                    }}
                                    filterOption={(inputValue, option) =>
                                        option?.value.toLowerCase().includes(inputValue.toLowerCase())
                                    }
                                />
                            </Form.Item>
                            <Form.Item name='approvalAuthority' label='Onay Makamı'>
                                <AutoComplete
                                    options={approvalAuthoritiesOptions}
                                    placeholder='Onay makamı seçin'
                                    allowClear
                                    filterOption={(inputValue, option) =>
                                        option?.value.toLowerCase().includes(inputValue.toLowerCase())
                                    }
                                />
                            </Form.Item>
                            <Form.Item name='approvalDateRange' label='Onay Tarih Aralığı'>
                                <DatePicker.RangePicker format='DD.MM.YYYY' style={{ width: '100%' }} allowClear />
                            </Form.Item>
                            <Space style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <Button type='primary' htmlType='submit' loading={loading}>
                                    Filtrele
                                </Button>
                                <Button type='default' onClick={handleExportToExcel}>
                                    Excel Olarak İndir
                                </Button>
                            </Space>
                        </Col>
                        <Col span={16}>
                            <Divider>Sonuçlar</Divider>
                            <Table
                                dataSource={meetings}
                                size='small'
                                columns={columns}
                                rowKey='id'
                                loading={loading}
                                pagination={{
                                    defaultPageSize: 5,
                                    showSizeChanger: true,
                                    showTotal: (total, range) => `${range[0]}-${range[1]} arası gösteriliyor, toplam ${total} kayıt bulundu.`
                                }}
                                scroll={{ x: 'max-content', y: '60vh' }}
                            />
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </ConfigProvider>
    );
};

export default FilterMeetingsModal;
