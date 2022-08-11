/* eslint-disable camelcase */
const Tb_sockets = require('../database/models/Tb_sockets')

const getSocketByUserId = async (user_id) => {
	try {
		const socket = await Tb_sockets.findOne({
			sock_user_id: user_id,
		})
		return socket
	} catch (error) {
		return { error: error.message }
	}
}

const deleteSocket = async (user_id) => {
	try {
		const socket = await Tb_sockets.deleteOne({
			sock_user_id: user_id,
		})
		return socket
	} catch (error) {
		return { error: error.message }
	}
}

const createNewSocket = async (user_id, socketId) => {
	const newSocket = new Tb_sockets({
		sock_id: socketId,
		sock_user_id: user_id,
	})
	try {
		const socketExist = await Tb_sockets.findOne({
			sock_user_id: user_id,
		})

		if (!socketExist) {
			const socketSave = await newSocket.save()
			return socketSave
		} else {
			return socketExist
		}
	} catch (error) {
		return { error: error.message }
	}
}

module.exports = { getSocketByUserId, createNewSocket, deleteSocket }
