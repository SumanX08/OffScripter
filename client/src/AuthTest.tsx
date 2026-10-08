import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";

export default function AuthTest() {

    const completeAttempt = async (attemptId: string) => {
  const token = await getToken();

  const response = await fetch(
    `http://localhost:5000/api/attempts/${attemptId}/complete`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  console.log("COMPLETE:", response.status, data);
};


    const spin = async () => {
  const token = await getToken();

  const response = await fetch(
    "http://localhost:5000/api/topic/spin",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    }
  );

  const data = await response.json();

  console.log("SPIN:", response.status, data);
};


  const { getToken } = useAuth();

  const createProfile = async () => {
    const token = await getToken();

    const response = await fetch(
      "http://localhost:5000/api/users/me",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: "suman08",
        }),
      }
    );

    const data = await response.json();

    console.log("CREATE PROFILE:", response.status, data);
  };

  const getProfile = async () => {
    const token = await getToken();

    const response = await fetch(
      "http://localhost:5000/api/users/me",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log("GET PROFILE:", response.status, data);
  };

  return (
    <div>
      <SignedOut>
        <SignInButton />
      </SignedOut>

      <SignedIn>
        <UserButton />

        <div>
          <button onClick={createProfile}>
            Create Profile
          </button>

          <button onClick={getProfile}>
            Get Profile
          </button>

          <button onClick={spin}>
  Spin Topic
</button>
        </div>
      </SignedIn>
    </div>
  );
}