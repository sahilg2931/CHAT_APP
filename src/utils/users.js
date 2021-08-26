const users = [];
//user ->room,name,id
const addUser = ({ id, username, room }) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if (!username || !room) {
        return {
            error: 'PLS ENTER YOUR DETAILS!'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if (existingUser) {
        return {
            error: 'Username is in use already'
        }
    }

    //store user
    const user = { id, username, room };
    users.push(user);
    return { user }; //same as {user:user}

}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}


module.exports = {
    addUser,
    removeUser,
    getUsersInRoom,
    getUser
}