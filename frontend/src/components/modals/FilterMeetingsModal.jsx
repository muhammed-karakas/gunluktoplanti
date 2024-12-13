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
            title: 'Konu', dataIndex: 'topic', key: 'topic',
            render: (text) => <div style={{ maxWidth: '50ch' }}>{text}</div>
        },
        {
            title: 'Yer', dataIndex: 'location', key: 'location',
            render: (text) => <div style={{ maxWidth: '50ch' }}>{text}</div>
        },
        {
            title: 'Tarih', dataIndex: 'meetingDatetime', key: 'meetingDatetime',
            render: (date) => (<div style={{ maxWidth: '50ch' }}> {date ? dayjs(date).format('DD.MM.YYYY HH:mm') : ''} </div>)
        },
        {
            title: 'Süre (dk)', dataIndex: 'duration', key: 'duration',
            render: (text) => <div style={{ maxWidth: '50ch' }}>{text}</div>
        },
        {
            title: 'Şirketler', dataIndex: 'companies', key: 'companies',
            render: (companies) => (<div style={{ maxWidth: '50ch' }}> {Array.isArray(companies) ? companies.join(', ') : companies} </div>)
        },
        {
            title: 'Şirket Katılımcıları', dataIndex: 'companyParticipants', key: 'companyParticipants',
            render: (participants) => (<div style={{ maxWidth: '50ch' }}> {Array.isArray(participants) ? participants.join(', ') : participants} </div>)
        },
        {
            title: 'Departmanlar', dataIndex: 'departments', key: 'departments',
            render: (depts) => (<div style={{ maxWidth: '50ch' }}> {Array.isArray(depts) ? depts.join(', ') : depts} </div>)
        },
        {
            title: 'Departman Katılımcıları', dataIndex: 'departmentParticipants', key: 'departmentParticipants',
            render: (participants) => (<div style={{ maxWidth: '50ch' }}> {Array.isArray(participants) ? participants.join(', ') : participants} </div>)
        },
        {
            title: 'Onay Makamları', dataIndex: 'approvalAuthorities', key: 'approvalAuthorities',
            render: (authorities) => (<div style={{ maxWidth: '50ch' }}> {Array.isArray(authorities) ? authorities.join(', ') : authorities} </div>)
        },
        {
            title: 'Onay Tarihi', dataIndex: 'approvalDatetime', key: 'approvalDatetime',
            render: (date) => (<div style={{ maxWidth: '50ch' }}> {date ? dayjs(date).format('DD.MM.YYYY HH:mm') : ''} </div>)
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

    return (
        <ConfigProvider locale={tr}>
            <Modal
                title='Toplantıları Filtrele'
                centered
                width='70vw'
                open={visible}
                onCancel={onClose}
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
                                pagination={{ pageSize: 5 }}
                                scroll={{ x: 'max-content', y: 'max-content' }}
                            />
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </ConfigProvider>
    );
};

export default FilterMeetingsModal;
