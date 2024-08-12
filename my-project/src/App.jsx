import { useState, useEffect } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";
import './App.css';
import { AiFillEdit, AiFillRest, AiOutlinePlus } from "react-icons/ai";
import { Modal, Form, Input, Button, message } from 'antd';

function App() {
  const [data, setData] = useState([]);
  const [adminmode, setAdminmode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editable, setEditable] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [form] = Form.useForm();

  // Dummy data
  const dummyData = [
    { id: 1, ques: "What is 2 + 2?", op1: "3", op2: "4", op3: "5", op4: "6", ans: "4" },
    { id: 2, ques: "What is 2 + 5?", op1: "3", op2: "4", op3: "5", op4: "7", ans: "7" },
    { id: 3, ques: "What is the capital of France?", op1: "London", op2: "Berlin", op3: "Paris", op4: "Madrid", ans: "Paris" }
  ];

  // Settings for the slider
  let settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:8080/questions');
        setData(res.data);
        if(res.data.length==0){
          setData(dummyData);
        }
      } catch (error) {
        console.error("Error fetching data", error);
        // Fallback to dummy data
        setData(dummyData);
      }
    };
    fetchData();
  }, []); 

  useEffect(() => {
    if (editable && currentIndex !== null) {
      form.setFieldsValue(data[currentIndex]);
    } else {
      form.resetFields();
    }
  }, [editable, currentIndex, form, data]);

  const showModal = (index, isEdit) => {
    setCurrentIndex(index);
    setEditable(isEdit);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditable(false);
    setCurrentIndex(null);
  };

  const handleDel = async (index) => {
    try {
      if (data === dummyData) {
        setData(data.filter((_, i) => i !== index)); // Remove item from local dummy data
        dummyData = data;
      } else {
        await axios.delete(`http://localhost:8080/questions/${data[index].id}`);
        message.success('Question deleted successfully!');
        setData(data.filter((_, i) => i !== index));
      }
    } catch (err) {
      console.error('Error deleting question:', err);
      message.error('An error occurred while deleting the question.');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editable) {
        if (data === dummyData) {
          setData(data.map((item, index) => index === currentIndex ? { ...item, ...values } : item));
          dummyData = data;
        } else {
          await axios.put(`http://localhost:8080/questions/${data[currentIndex].id}`, values);
          message.success('Question updated successfully!');
        }
      } else {
        if (data === dummyData) {
          const newQuestion = { ...values, id: data.length + 1 };
          setData([...data, newQuestion]);
          dummyData = data;
        } else {
          await axios.post('http://localhost:8080/questions', values);
          message.success('Question added successfully!');
        }
      }

      // Reload the data
      if (data !== dummyData) {
        const res = await axios.get('http://localhost:8080/questions');
        setData(res.data);
      }
      setIsModalVisible(false);
    } catch (err) {
      console.error('Error submitting form:', err);
      message.error('An error occurred while processing your request.');
    }
  };

  return (
    <>
      <button className='ml-5 mt-5 font-bold' onClick={() => setAdminmode(!adminmode)}>ADMIN MODE</button>

      <div className='w-full h-full'>
        <div className='w-1/2 mt-56 mx-auto bg-black rounded-sm border'>
          <div className='p-20 my-auto'>
            {data.length === 0 && <AiOutlinePlus color='white' size={24} onClick={() => showModal(null, false)} />}
            <Slider {...settings}>
              {data.map((datael, index) => (
                <div key={datael.id} className='card-container'>
                  {adminmode && <div className='flex space-x-2'>
                    <AiOutlinePlus color='white' size={24} onClick={() => showModal(null, false)} />
                    <AiFillEdit color='white' size={24} onClick={() => showModal(index, true)} />
                    <AiFillRest color='white' size={24} onClick={() => handleDel(index)} />
                  </div>}
                  <div className='card'>
                    <div className='card-front'>
                      <div className="font-bold text-lg mb-2">{datael.ques}</div>
                      <div>{datael.op1}</div>
                      <div>{datael.op2}</div>
                      <div>{datael.op3}</div>
                      <div>{datael.op4}</div>
                    </div>
                    <div className='card-back'>
                      <div className="font-bold text-lg">Answer</div>
                      <div>{datael.ans}</div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>

      <Modal
        visible={isModalVisible}
        title={editable ? 'Edit Question' : 'Add Question'}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
        >
          <Form.Item label='Question' name='ques' rules={[{ required: true, message: 'Please input the question!' }]}>
            <Input type='text' />
          </Form.Item>
          <Form.Item label='Option1' name='op1' rules={[{ required: true, message: 'Please input option 1!' }]}>
            <Input type='text' />
          </Form.Item>
          <Form.Item label='Option2' name='op2' rules={[{ required: true, message: 'Please input option 2!' }]}>
            <Input type='text' />
          </Form.Item>
          <Form.Item label='Option3' name='op3' rules={[{ required: true, message: 'Please input option 3!' }]}>
            <Input type='text' />
          </Form.Item>
          <Form.Item label='Option4' name='op4' rules={[{ required: true, message: 'Please input option 4!' }]}>
            <Input type='text' />
          </Form.Item>
          <Form.Item label='Answer' name='ans' rules={[{ required: true, message: 'Please input the answer!' }]}>
            <Input type='text' />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              {editable ? 'Save' : 'Add'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default App;
