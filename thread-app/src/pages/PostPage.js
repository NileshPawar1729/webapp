import { Avatar, Box, Button, Divider, Flex, Image, Spinner, Text, useToast } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import Comment from '../components/Comment'
import Actions from '../components/Actions'
import { formatDistanceToNow } from 'date-fns'
import useGetUserProfile from '../hooks/useGetUserProfile'
import { useNavigate, useParams } from 'react-router-dom'
import { DeleteIcon } from '@chakra-ui/icons'
import { useRecoilValue , useRecoilState} from 'recoil'
import userAtom from '../atoms/userAtom'
import postsAtom from '../atoms/postsAtom'

const PostPage = () => {
  const toast = useToast();
  const currentUser = useRecoilValue(userAtom);
  const { loading, user } = useGetUserProfile();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const { pid } = useParams();
  const navigate = useNavigate();
  const currentPost = posts[0];

  useEffect(() => {
    const getPost = async () => {
       setPosts([]);
      try {

        const res = await fetch(`/api/posts/${pid}`);
        const data = await res.json();
        if (data.error) {
          toast({
            title: "Error",
            description: data.error,
            status: "error",
            duration: 3000,
            isClosable: true
          })
          return
        }
        
        setPosts([data]);

      } catch (error) {
        toast({
          title: "Error",
          description: error,
          status: "error",
          duration: 3000,
          isClosable: true
        })
      }

    }
    getPost();
  }, [toast, pid, setPosts])


  const handleDeletePost = async () => {
    try {
      if (!window.confirm("Are you sure you want to delete this post")) return;

      const res = await fetch(`/api/posts/${currentPost._id}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          status: "error",
          duration: 3000,
          isClosable: true
        })
        return
      }

      toast({
        title: "Success",
        description: "Post deleted",
        status: "success",
        duration: 3000,
        isClosable: true
      })

      navigate(`/${user.username}`);

    } catch (error) {
      toast({
        title: "Error",
        description: error,
        status: "error",
        duration: 3000,
        isClosable: true
      })
    }
  }

  if (!user && loading) {
    return (
      <Flex justifyContent={'center'}>
        <Spinner size={'xl'} />
      </Flex>
    )
  }

  if (!currentPost) return null;

  return (
    <>
      <Flex>
        <Flex w={'full'} alignItems={'center'} gap={3}>
          <Avatar src={user.profilePic} size={'md'} name='Mark Zuckerberg' />
          <Flex>
            <Text fontSize={'sm'} fontWeight={'bold'}>{user.username}</Text>
            <Image src='/verified.png' w='4' h={4} ml={4} />
          </Flex>
        </Flex>
        <Flex gap={4} alignItems={'center'}>
          <Text fontSize={'sm'} width={36} textAlign={'right'} color={'gray.light'}>
            {formatDistanceToNow(new Date(currentPost.createdAt))} ago
          </Text>
          {currentUser?._id === user._id && (
            <DeleteIcon size={20} onClick={handleDeletePost} cursor={'pointer'} />
          )}
        </Flex>
      </Flex>
      <Text my={3}>{currentPost.text}</Text>

      {currentPost.img && (
        <Box borderRadius={6}
          border={'1px solid'}
          overflow={'hidden'}
          borderColor={'gray.light'}>
          <Image src={currentPost.img} w={'full'} />
        </Box>
      )}

      <Flex gap={3} my={3}>
        <Actions post={currentPost} />
      </Flex>

      <Divider my={4} />

      <Flex justifyContent={'space-between'}>
        <Flex gap={2} alignItems={'center'}>
          <Text fontSize={'2xl'}>👏</Text>
          <Text color={'gray.light'}>Get the app to reply, like and post</Text>
        </Flex>
        <Button>Get</Button>
      </Flex>
      <Divider my={4} />

      {currentPost.replies.map(reply => (
        <Comment
          key={reply._id}
          reply={reply}
          lastReply={reply._id === currentPost.replies[currentPost.replies.length - 1]._id}
        />
      ))}


    </>
  )
}

export default PostPage
