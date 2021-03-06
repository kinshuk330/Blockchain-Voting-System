import React, { useState } from "react";
import { Form, Input, Divider, Button, Typography, Row, Col, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { DeleteOutlined } from "@ant-design/icons";
import { AddressInput } from "../components";
const { Title } = Typography;
const axios = require("axios");

export default function QuadraticDiplomacyCreate({
  mainnetProvider,
  serverUrl,
  address,
  userSigner,
  currentDistribution,
  setCurrentDistribution,
  isAdmin,
}) {
  const [voters, setVoters] = useState([""]);
  const [candidates, setCandidates] = useState([""]);
  const [voteAllocation, setVoteAllocation] = useState(0);
  const [isSendingTx, setIsSendingTx] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    setIsSendingTx(true);
    const filteredVoters = voters.filter(voter => voter);
    const filteredCandidates = candidates.filter(voter => voter);

    let message = "qdip-creation-" + address;
    console.log("Message:" + message);

    const signature = await userSigner.signMessage(message);

    axios
      .post(serverUrl + "distributions", {
        address: address,
        voteAllocation: voteAllocation,
        members: filteredVoters,
        candidates: filteredCandidates,
        signature: signature,
      })
      .then(response => {
        console.log(response);
        setCurrentDistribution(response);
        setVoters([""]);
        setVoteAllocation(0);
        form.resetFields();
        setIsSendingTx(false);
      })
      .catch(() => {
        console.log("Error on distributions post");
      });
  };

  if (!isAdmin) {
    return (
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 800, margin: "auto", marginTop: 64 }}>
        <Title level={4}>Access denied</Title>
        <p>Only admins can create distributions.</p>
      </div>
    );
  }

  if (currentDistribution.id) {
    return (
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 800, margin: "auto", marginTop: 64 }}>
        <Title level={4}>Distribution {currentDistribution.id} in progress</Title>
      </div>
    );
  }

  return (
    <div
      style={{ border: "1px solid", padding: "40px", width: "800px", margin: "64px auto 0px auto", textAlign: "left" }}
    >
      <Title level={3} style={{ fontFamily: "Space Mono" }}>
        Add members
      </Title>
      <Divider />
      <Form
        form={form}
        name="basic"
        onFinish={handleSubmit}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        layout="horizontal"
      >
        <Form.Item
          label="Vote Allocation"
          name="voteCredit"
          style={{ textAlign: "left" }}
          tooltip="Number of votes each voter will have"
        >
          <Input
            type="number"
            placeholder="100"
            style={{ width: "30%" }}
            onChange={event => setVoteAllocation(event.target.value)}
          />
        </Form.Item>
        <Divider />

        {voters.map((_, index) => (
          <VoterInput
            key={index}
            index={index}
            setVoters={setVoters}
            voters={voters}
            mainnetProvider={mainnetProvider}
          />
        ))}
        <Form.Item style={{ justifyContent: "center", marginTop: 24 }}>
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={() => setVoters(prevVoters => [...prevVoters, ""])}
          >
            Add Voter
          </Button>
        </Form.Item>
        <Divider />

        {candidates.map((_, index) => (
          <VoterInput
            key={index}
            index={index}
            setVoters={setCandidates}
            voters={candidates}
            mainnetProvider={mainnetProvider}
          />
        ))}
        <Form.Item style={{ justifyContent: "center", marginTop: 24 }}>
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={() => setCandidates(prevCandidates => [...prevCandidates, ""])}
          >
            Add Candidate
          </Button>
        </Form.Item>
        <Divider />
        <Form.Item wrapperCol={{ offset: 16, span: 8 }}>
          {!isSendingTx ? (
            <Button className="btn-bvs" htmlType="submit" block disabled={!voteAllocation}>
              Submit
            </Button>
          ) : (
            <Spin size="small" />
          )}
        </Form.Item>
      </Form>
    </div>
  );
}

const VoterInput = ({ index, voters, setVoters, mainnetProvider }) => {
  return (
    <>
      <Form.Item label={`Voter ${index + 1}`} name={`address[${index}]`} style={{ marginBottom: "16px" }}>
        <Row gutter={8} align="middle">
          <Col span={16}>
            <AddressInput
              autoFocus
              ensProvider={mainnetProvider}
              placeholder="Enter address"
              value={voters[index]}
              onChange={address => {
                setVoters(prevVoters => {
                  const nextVoters = [...prevVoters];
                  nextVoters[index] = address;
                  return nextVoters;
                });
              }}
            />
          </Col>
          <Col span={8}>
            <DeleteOutlined
              style={{ cursor: "pointer", color: "#ff6666" }}
              onClick={() => {
                setVoters(prevVoters => {
                  const nextVoters = [...prevVoters];
                  return nextVoters.filter((_, i) => i !== index);
                });
              }}
            />
          </Col>
        </Row>
      </Form.Item>
    </>
  );
};
