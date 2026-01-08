// Sample data matching the user's JSON structure
export const sampleData = {
    content: {
        categories: [
            {
                categoryId: "1",
                name: "Image",
                imageLink: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop"
            },
            {
                categoryId: "2",
                name: "Video",
                imageLink: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
            },
            {
                categoryId: "3",
                name: "Art",
                imageLink: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
            },
            {
                categoryId: "4",
                name: "Design",
                imageLink: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop"
            },
            {
                categoryId: "5",
                name: "Tech",
                imageLink: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop"
            },
            {
                categoryId: "6",
                name: "Music",
                imageLink: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop"
            },
            {
                categoryId: "7",
                name: "Photo",
                imageLink: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop"
            }
        ],
        items: [
            {
                itemId: "1",
                head: "CINEMATIC PROMPT & IMAGE ARCHITECT",
                categoryId: "1",
                description: "Profesyonel film yapımcılarının kullandığı sinematik teknikleri AI ile birleştirerek benzersiz görseller oluşturun. Her sahne, her kare özenle tasarlandı.",
                username: "ai_architect",
                userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
                likes: 1247,
                comments: 89,
                timeAgo: "2s",
                images: [
                    {
                        name: "Cyberpunk City",
                        imageLink: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=800&fit=crop"
                    },
                    {
                        name: "Neon Dreams",
                        imageLink: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=800&fit=crop"
                    },
                    {
                        name: "Future Vision",
                        imageLink: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=800&fit=crop"
                    }
                ],
                chatBot: {
                    model: "gemini",
                    prompt: "Sen sinematik görsel tasarım konusunda uzman bir AI asistansın. Kullanıcılara profesyonel film yapımcılarının kullandığı teknikleri açıkla ve benzersiz prompt önerileri sun.",
                    binary: [
                        { type: "image", enabled: true },
                        { type: "file", enabled: true },
                        { type: "video", enabled: true }
                    ]
                }
            },
            {
                itemId: "2",
                head: "CREATIVE VIDEO GENERATOR",
                categoryId: "2",
                description: "AI destekli video üretim teknolojisi ile hayallerinizdeki videoları gerçeğe dönüştürün. Tek bir prompt ile profesyonel içerikler.",
                username: "video_master",
                userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
                likes: 892,
                comments: 45,
                timeAgo: "4s",
                images: [
                    {
                        name: "Abstract Motion",
                        imageLink: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=800&fit=crop"
                    },
                    {
                        name: "Digital Art",
                        imageLink: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&h=800&fit=crop"
                    }
                ],
                chatBot: {
                    model: "gemini",
                    prompt: "Sen video üretimi konusunda uzman bir AI asistansın. Kullanıcılara yaratıcı video fikirleri sun ve profesyonel prodüksiyon teknikleri hakkında bilgi ver.",
                    binary: [
                        { type: "image", enabled: true },
                        { type: "file", enabled: true },
                        { type: "video", enabled: true }
                    ]
                }
            },
            {
                itemId: "3",
                head: "ARTISTIC STYLE TRANSFER",
                categoryId: "3",
                description: "Fotoğraflarınızı ünlü sanatçıların tarzında yeniden yorumlayın. Van Gogh'tan Picasso'ya, her tarz parmaklarınızın ucunda.",
                username: "art_studio",
                userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
                likes: 2103,
                comments: 156,
                timeAgo: "1g",
                images: [
                    {
                        name: "Oil Painting Style",
                        imageLink: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=800&fit=crop"
                    }
                ],
                chatBot: {
                    model: "gemini",
                    prompt: "Sen sanat tarihi ve stil transferi konusunda uzman bir AI asistansın. Kullanıcılara farklı sanat akımları ve tarzları hakkında bilgi ver.",
                    binary: [
                        { type: "image", enabled: true },
                        { type: "file", enabled: false },
                        { type: "video", enabled: false }
                    ]
                }
            }
        ]
    }
};
