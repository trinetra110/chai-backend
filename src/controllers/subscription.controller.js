import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const subscriberId = req.user._id

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const subscriber = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    })

    if (subscriber) {
        // if already subscribed, then unsubscribe
        await subscriber.deleteOne()

        return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Unsubscribed successfully")
        )
    }

    // if not subscribed, then subscribe
    const newSubscription = new Subscription({
        subscriber: subscriberId,
        channel: channelId
    })

    await newSubscription.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, null, "Subscribed successfully")
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const subscribers = await Subscription.find({ channel: subscriberId }).populate("subscriber", "username")

    if (!subscribers || subscribers.length === 0) {
        throw new ApiError(404, "No subscriber found for this channel")
    }

    const subscriberList = subscribers.map((sub) => sub.subscriber);
    //console.log(subscriberList)

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscriberList, "Subscribers fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const channels = await Subscription.find({ subscriber: channelId }).populate("channel", "username")

    if (!channels || channels.length === 0) {
        throw new ApiError(404, "No channels found for this subscriber")
    }

    const channelList = channels.map((sub) => sub.channel);
    //console.log(channelList)

    return res
    .status(200)
    .json(
        new ApiResponse(200, channelList, "Channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}