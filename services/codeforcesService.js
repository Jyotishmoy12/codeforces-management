import axios from 'axios';
import Student from '../models/student.js';
import dotenv from 'dotenv';
dotenv.config();
const BASE_URL = process.env.CODEFORCES_BASE_URL;

export const fetchUserRating = async (handle) => {
    try {
        const response = await axios.get(`${BASE_URL}/user.rating?handle=${handle}`);
        console.log("Response from Codeforces API:", response.data);
        return response.data.result;
    } catch (error) {
        console.error("Error fetching user rating from Codeforces:", error);
        throw new Error("Failed to fetch user rating from Codeforces");

    }
}

export const fetchUserSubmissions = async (handle)=>{
    try{
        const response = await axios.get(`${BASE_URL}/user.status?handle=${handle}`);
        console.log("Response from Codeforces API:", response.data);
        return response.data.result;
    }catch(error){
        console.error("Error fetching user submissions from Codeforces:", error);
        throw new Error("Failed to fetch user submissions from Codeforces");
    }
}

export const syncStudentData = async(student)=>{
    const { cfHandle } = student;

  const ratings = await fetchUserRating(cfHandle);
  const submissions = await fetchUserSubmissions(cfHandle);

  const solved = new Set();
  const solvedProblems = [];
  let maxRating = student.maxRating || 0;
  let latestSubmissionTime = 0;

  for (let sub of submissions) {
  if (sub.verdict === "OK" && sub.problem.rating) {
    const id = `${sub.problem.contestId}-${sub.problem.index}`;
    if (!solved.has(id)) {
      solved.add(id);
      solvedProblems.push({
        name: sub.problem.name,
        problemId: `${sub.problem.contestId}${sub.problem.index}`,
        rating: sub.problem.rating,
        tags: sub.problem.tags || [],
        verdict: sub.verdict,
        time: new Date(sub.creationTimeSeconds * 1000)
      });
      maxRating = Math.max(maxRating, sub.problem.rating);
      latestSubmissionTime = Math.max(latestSubmissionTime, sub.creationTimeSeconds);
    }
  }
}


  const currentRating = ratings.length ? ratings[ratings.length - 1].newRating : student.currentRating;

 
  await Student.findByIdAndUpdate(student._id, {
  currentRating,
  maxRating,
  cfDataLastUpdated: new Date(latestSubmissionTime * 1000),
  cfContests: ratings.map(r => ({
    contestId: r.contestId,
    name: r.contestName,
    date: new Date(r.ratingUpdateTimeSeconds * 1000),
    rank: r.rank,
    oldRating: r.oldRating,
    newRating: r.newRating,
    delta: r.newRating - r.oldRating,
    unsolvedCount: 0
  })),
  cfSubmissions: solvedProblems
});


  return {
    ratings,
    solvedProblems,
    latestSubmissionTime
  };
}

export default {
    fetchUserRating,
    fetchUserSubmissions,
    syncStudentData
};