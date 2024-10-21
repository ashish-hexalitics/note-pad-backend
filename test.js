// 1. Write a JavaScript function to calculate the sum of two numbers.
function sumOfTwoNumber(a, b) {
  return a + b;
}
console.log("sum of two number is", sumOfTwoNumber(4, 9));

// 2. Write a JavaScript program to find the maximum number in an array.
const abc = [2, 5, 3, 5, 6, 8, 9, 10, 55, 4, 6, 33];

function findMaxNumber(arr) {
  let max;
  for (let i = 0; i < arr.length; i++) {
    max = arr[i];
    for (let j = 1; j < arr.length; j++) {
      if (max < abc[j]) {
        max = abc[j];
      }
    }
  }
  return { max };
}

console.log("max number is", findMaxNumber(abc));

// 3. Write a JavaScript function to check if a given string is a palindrome (reads the same forwards and backwards).

function isPalindrome(str) {
  return str === str.split('"').reverse().join('"');
}
console.log("isPalindrome", isPalindrome(`this is ashish`));

// 4. Write a JavaScript program to reverse a given string.
function reverseString(str) {
  let reversedStr = "";
  let strArry = [];
  for (let i = 0; i < str.length; i++) {
    strArry.push(str[i]);
  }
  reversedStr = strArry.reverse().join("");
  return reversedStr;
}

// Example usage:
const originalString = "Hello, World!";
const reversed = reverseString(originalString);
console.log("Reversed string is:", reversed);

// 5. Write a JavaScript function that takes an array of numbers and returns a new array with only the even numbers.

function filterEvenOrOddNumbers(numbers) {
  return {
    evenNumber: numbers.filter((num) => num % 2 === 0),
    oddNumber: numbers.filter((num) => num % 2 !== 0),
  };
}

console.log(filterEvenOrOddNumbers([2, 5, 3, 5, 6, 8, 9, 10, 55, 4, 6, 33]));

// 6. Write a JavaScript program to calculate the factorial of a given number.

function factorial(number) {
  if (number === 0 || number === 1) {
    return 1;
  } else {
    return number * factorial(number - 1);
  }
}

console.log(factorial(3));

// 7. Write a JavaScript function to check if a given number is prime.

function isPrime(num) {
  if (num <= 1) {
    return false;
  }

  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) {
      return false;
    }
  }

  return true;
}

const number = 7;
const result = isPrime(number);
console.log(number + " is prime:", result);


// 10. Write a JavaScript program to convert a string to title case (capitalize the first letter of each word). 

function fibonacciSequence(numTerms) { 

    if (numTerms <= 0) return []; 
  
    if (numTerms === 1) return [0]; 
  
     
  
    let sequence = [0, 1]; 
  
    while (sequence.length < numTerms) { 
  
      let nextNumber = sequence[sequence.length - 1] + sequence[sequence.length - 2]; 
  
      sequence.push(nextNumber); 
  
    } 
  
    return sequence; 
  
  } 

  console.log(fibonacciSequence(7))
