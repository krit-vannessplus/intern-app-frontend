"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/utils/config";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Position {
  name: string;
  availability: boolean;
}

const PositionManager = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [newPositionName, setNewPositionName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/positions/getAllPositions`
      );
      setPositions(response.data.positions);
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
    // setPositions([
    //   { name: "Software Engineer", availability: true },
    //   { name: "Product Manager", availability: false },
    //   { name: "Fullstack Developer", availability: true },
    // ]); // Mock data for testing
    setLoading(false);
  };

  const toggleAvailability = async (name: string, availability: boolean) => {
    try {
      await axios.patch(`${API_URL}/api/positions/update/${name}`, {
        availability: !availability,
      });
      fetchPositions(); // Refresh the list
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  const createPosition = async () => {
    if (!newPositionName) return;
    try {
      await axios.post(`${API_URL}/api/positions/create`, {
        name: newPositionName,
      });
      setNewPositionName("");
      fetchPositions();
    } catch (error) {
      console.error("Error creating position:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-xl font-bold">Positions</h1>
      {loading ? (
        <p>Loading positions...</p>
      ) : (
        <div className="space-y-2">
          {positions &&
            positions.map((position) => (
              <Card key={position.name}>
                <CardHeader>
                  <CardTitle>{position.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Availability:{" "}
                    {position.availability ? "Available" : "Unavailable"}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() =>
                      toggleAvailability(position.name, position.availability)
                    }
                  >
                    Change Availability
                  </Button>
                </CardFooter>
              </Card>
            ))}
          <Card>
            <CardHeader>
              <CardTitle>Create New Position</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                value={newPositionName}
                onChange={(e) => setNewPositionName(e.target.value)}
                placeholder="Enter position name"
              />
            </CardContent>
            <CardFooter>
              <Button onClick={createPosition}>Create</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PositionManager;
