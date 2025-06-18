"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/utils/config";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";

interface SkillTest {
  name: string;
  pdf: string; // URL or path to the PDF file
  position: string;
}

interface Position {
  name: string;
  availability: boolean;
}

const SkillTestManager = () => {
  const [skillTests, setSkillTests] = useState<SkillTest[]>([]);
  const [newSkillTestName, setNewSkillTestName] = useState("");
  const [newSkillTestPdf, setNewSkillTestPdf] = useState<File | null>(null);
  const [newSkillTestPosition, setNewSkillTestPosition] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkillTests();
    fetchPositions();
  }, []);

  // Fetch all current skill tests.
  const fetchSkillTests = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/skillTests/getAllSkillTests`
      );
      setSkillTests(response.data.skillTests);
      console.log("Skill Tests:", response.data.skillTests);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching skill tests:", error);
    }
  };

  // Fetch all available positions.
  const fetchPositions = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/positions/getAllPositions`
      );
      setPositions(response.data.positions);
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  // Handle PDF file upload.
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewSkillTestPdf(e.target.files[0]);
    }
  };

  // Create a new skill test, including the file and selected position.
  const createSkillTest = async () => {
    if (!newSkillTestName || !newSkillTestPdf || !newSkillTestPosition) return;
    try {
      const formData = new FormData();
      formData.append("name", newSkillTestName);
      formData.append("pdf", newSkillTestPdf);
      formData.append("position", newSkillTestPosition);

      await axios.post(`${API_URL}/api/skillTests/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchSkillTests(); // Refresh the list
      setNewSkillTestName("");
      setNewSkillTestPdf(null);
      setNewSkillTestPosition("");
    } catch (error) {
      console.error("Error creating skill test:", error);
    }
  };

  //Delete a skill test by its name.
  const deleteSkillTest = async (name: string) => {
    try {
      await axios.delete(`${API_URL}/api/skillTests/delete/${name}`);
      fetchSkillTests(); // Refresh the list
    } catch (error) {
      console.error("Error deleting skill test:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-xl font-bold">Skill Tests</h1>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Create New Skill Test</h2>
        <Input
          placeholder="Skill Test Name"
          value={newSkillTestName}
          onChange={(e) => setNewSkillTestName(e.target.value)}
          className="mb-2"
        />
        {/* PDF File Input */}
        <input
          type="file"
          accept="application/pdf"
          onChange={handlePdfUpload}
          className="mb-2 border p-2 rounded"
        />
        {/* Position Select Dropdown */}
        <Label>Position</Label>
        <Select
          onValueChange={(value) => setNewSkillTestPosition(value)}
          defaultValue={newSkillTestPosition}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {positions.map((pos) => (
                <SelectItem key={pos.name} value={pos.name}>
                  {pos.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button onClick={createSkillTest}>Create Skill Test</Button>
      </div>
      {loading ? (
        <p>Loading skill tests...</p>
      ) : (
        <div className="space-y-2">
          {skillTests &&
            skillTests.map((test) => (
              <Card key={test.name}>
                <CardHeader>
                  <CardTitle>{test.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    PDF:{" "}
                    <a
                      href={`${test.pdf}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View PDF
                    </a>
                  </p>
                  <p>Position: {test.position}</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={deleteSkillTest.bind(null, test.name)}>
                    Delete Skill Test
                  </Button>
                </CardFooter>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default SkillTestManager;
