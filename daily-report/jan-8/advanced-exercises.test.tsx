import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// A simple function to start learning
const subtract = (a: number, b: number) => a - b;

describe("subtract function", () => {
 it("should subtract two numbers correctly", () => {
   const result = subtract(5, 2);
   expect(result).toBe(3);
 });

 it("should handle negative results", () => {
   const result = subtract(2, 5);
   expect(result).toBe(-3);
 });
});

const user = {
 name: "Jason",
 age: 30,
};

describe("user object", () => {
 it("should match the expected structure", () => expect(user).toEqual({ name: "Jason", age: 30 }));
 it("should have the correct name", () => expect(user.name).toBe("Jason"));
});

const tags = ["Student", "Coder"];
it("should have a length of 2", () => expect(tags).toHaveLength(2));

// One describe block can contain multiple tests
describe("User Details", () => {
 it("should have the correct name", () => expect(user.name).toBe("Jason"));
 it("should match the user object", () => expect(user).toEqual({ name: "Jason", age: 30 }));
});

// Lifecycle hook: beforeEach
let score = 0;
beforeEach(() => {
 score = 10; // Reset score to 10 before each test
});

it("test case 1: increment score", () => {
 score += 5;
 expect(score).toBe(15);
});

it("test case 2: check reset score", () => {
 expect(score).toBe(10);
});

// toBeDefined
it("Example of toBeDefined", () => {
 const user = { name: "Jason", age: 30 };
 expect(user.name).toBeDefined(); // PASS: name exists
 expect((user as any).email).not.toBeDefined(); // PASS: email is undefined
});

// toBeNull
it("Example of toBeNull", () => {
 expect(null).toBeNull(); // PASS: explicitly null
});

// toBeTruthy and toBeFalsy
it("Example of toBeTruthy", () => {
 const score = 100;
 const message = "Hello";
 const myArr = [];

 expect(score).toBeTruthy(); // 100 is truthy
 expect(message).toBeTruthy(); // Non-empty string is truthy
 expect(myArr).toBeTruthy(); // Empty array is truthy in JS
});

// toThrow: Testing exceptions
const setAge = (age: number) => {
 if (age < 0) {
   throw new Error("Age cannot be negative!");
 }
 if (age < 18) {
   throw new Error("You are not an adult yet!");
 }
 return `Your age is ${age}`;
};

describe("Exception testing with toThrow", () => {
 it("should throw an error for negative age", () => {
   expect(() => setAge(-1)).toThrow("Age cannot be negative!");
 });

 it("should throw an error for age under 18", () => {
   expect(() => setAge(15)).toThrow();
 });

 it("should work normally for valid age", () => {
   expect(() => setAge(20)).not.toThrow();
   expect(setAge(20)).toBe("Your age is 20");
 });
});

// Asynchronous Testing (async/await)
const fetchUser = async (id: number) => {
 return new Promise((resolve, reject) => {
   setTimeout(() => {
     if (id === 1) resolve({ id, name: "Jason" });
     else reject(new Error("User not found"));
   }, 1000);
 });
};

describe("Async testing (async await)", () => {
 it("should return user when found", async () => {
   const user = await fetchUser(1);
   expect(user).toEqual({ id: 1, name: "Jason" });
 });

 it("should throw error when user is not found", async () => {
   await expect(fetchUser(2)).rejects.toThrow("User not found");
 });
});

// Mocking functions with vi.fn()
const performLogin = (
 credentials: { username: string; password: string },
 loginApi: (u: string, p: string) => void,
) => {
 loginApi(credentials.username, credentials.password);
};

describe("Mocking Login API", () => {
 it("should send correct credentials to the API", () => {
   const mockLoginApi = vi.fn();
   const myCredentials = { username: "jason", password: "123456" };
   performLogin(myCredentials, mockLoginApi);
   
   expect(mockLoginApi).toHaveBeenCalledWith("jason", "123456");
   expect(mockLoginApi).toHaveBeenCalledTimes(1);
 });
});

// React Component Testing
const Counter = () => {
 const [count, setCount] = useState(0);
 return (
   <div>
     <h1 data-testid="count-value">{count}</h1>
     <button onClick={() => setCount(count + 1)}>Increment</button>
   </div>
 );
};

describe("Counter Component", () => {
 it("should display 0 initially", () => {
   render(<Counter />);
   const countElement = screen.getByTestId("count-value");
   expect(countElement.textContent).toBe("0");
 });

 it("should increment the value when the button is clicked", () => {
   render(<Counter />);
   const button = screen.getByText("Increment");
   fireEvent.click(button);
   const countElement = screen.getByTestId("count-value");
   expect(countElement.textContent).toBe("1");
 });
});
