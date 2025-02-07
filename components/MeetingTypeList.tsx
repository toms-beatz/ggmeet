import Image from 'next/image'
import React, { useState } from 'react'
import HomeCard from './HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModal from './MeetingModal'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import ReactDatePicker, { registerLocale, setDefaultLocale } from 'react-datepicker'
import { fr } from 'date-fns/locale/fr';
import { Input } from "@/components/ui/input"

registerLocale('fr', fr)


const MeetingTypeList = () => {
    const router = useRouter();
    const [meetingState, setMeetingState] = useState<'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined>();

    const { user } = useUser();
    const client = useStreamVideoClient();
    const [values, setValues] = useState({
        dateTime: new Date(),
        description: '',
        link: '',
    })

    const [callDetails, setCallDetails] = useState<Call>();
    const { toast } = useToast()

    const createMeeting = async () => {
        if (!client || !user) return;
        try {

            if (!values.dateTime) {
                toast({
                    title: "Please select a date and time",
                })
                return;
            }
            const id = crypto.randomUUID();
            const call = client.call('default', id);

            if (!call) throw new Error('Failed to create call');

            const startsAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
            const description = values.description || 'Instant meeting';

            await call.getOrCreate({
                data: {
                    starts_at: startsAt,
                    custom: {
                        description,
                    }
                }
            })

            setCallDetails(call);

            if (!values.description) {
                router.push(`/meeting/${call.id}`);
            }
            toast({ title: "Meeting created" })

        } catch (error) {
            console.error('Error creating meeting', error)
            toast({
                title: "Failed to create meeting",
            })

        }
    }

    const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`;
    return (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <HomeCard
                img='/icons/add-meeting.svg'
                title='New meeting'
                description='Start an instant meeting'
                handleClick={() => setMeetingState('isInstantMeeting')}
                className='bg-orange-1'
            />
            <HomeCard
                img='/icons/schedule.svg'
                title='Schedule meeting'
                description='Plan your meeting'
                handleClick={() => setMeetingState('isScheduleMeeting')}
                className='bg-blue-1'
            />
            <HomeCard
                img='/icons/recordings.svg'
                title='View recordings'
                description='Check out your recordings'
                handleClick={() => router.push('/recordings')}
                className='bg-purple-1'
            />
            <HomeCard
                img='/icons/join-meeting.svg'
                title='Join meeting'
                description='via invitation link'
                handleClick={() => setMeetingState('isJoiningMeeting')}
                className='bg-yellow-1'
            />

            {!callDetails ? (
                <MeetingModal
                    isOpen={meetingState === 'isScheduleMeeting'}
                    onClose={() => setMeetingState(undefined)}
                    title='Create meeting'
                    handleClick={createMeeting}
                >
                    <div className="flex glex-col gap-2 5">
                        <label className='text-base text-normal leading-[22px] text-sky-2'>
                            Add a description
                        </label>
                        <Textarea
                            className='border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0'
                            onChange={(e) => {
                                setValues({
                                    ...values, description: e.target.value
                                })
                            }}
                        />
                    </div>
                    <div className="flex w-full flex-col gap-2.5">
                        <label className='text-base text-normal leading-[22px] text-sky-2'>
                            Add a date and time
                        </label>
                        <ReactDatePicker
                            selected={values.dateTime}
                            onChange={(date) => setValues({ ...values, dateTime: date! })}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            timeCaption="time"
                            dateFormat="dd MMMM yyyy à h:mm"
                            locale={'fr'}
                            className='w-full rounded bg-dark-3 focus:outline-none p-2' />
                    </div>
                </MeetingModal>
            ) : (
                <MeetingModal
                    isOpen={meetingState === 'isScheduleMeeting'}
                    onClose={() => setMeetingState(undefined)}
                    title='Meeting Created'
                    className="text-center"
                    handleClick={() => {
                        navigator.clipboard.writeText(meetingLink);
                        toast({ title: "Link copied to clipboard" })
                    }}
                    image="/icons/checked.svg"
                    buttonIcon='/icons/copy.svg'
                    buttonText="Copy link"
                />
            )}

            <MeetingModal
                isOpen={meetingState === 'isInstantMeeting'}
                onClose={() => setMeetingState(undefined)}
                title='Start an instant meeting'
                className="text-center"
                buttonText='Start meeting'
                handleClick={createMeeting}
            />

            <MeetingModal
                isOpen={meetingState === 'isJoiningMeeting'}
                onClose={() => setMeetingState(undefined)}
                title='Type the link here'
                className="text-center"
                buttonText='Join meeting'
                handleClick={() => router.push(values.link)}
            >
                <Input
                    placeholder='Meeting Link'
                    className='border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0'
                    onChange={(e) => setValues({...values, link: e.target.value})}
                />
            </MeetingModal>


        </section>
    )
}

export default MeetingTypeList