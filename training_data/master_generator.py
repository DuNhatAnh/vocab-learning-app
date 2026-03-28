import json
import os

def save_json(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

output_dir = "/Users/dunhatanh/Desktop/English v2/vocab-learning-app/training_data"
os.makedirs(output_dir, exist_ok=True)

# 1. Spelling Correction (Diverse and Unique)
spelling_samples = [
    ("appel", "apple", "quả táo"), ("freind", "friend", "người bạn"), ("recived", "received", "đã nhận"),
    ("tommorow", "tomorrow", "ngày mai"), ("seperate", "separate", "tách biệt"), ("definately", "definitely", "chắc chắn"),
    ("untill", "until", "cho đến khi"), ("calender", "calendar", "lịch"), ("occured", "occurred", "đã xảy ra"),
    ("neccessary", "necessary", "cần thiết"), ("beleive", "believe", "tin tưởng"), ("truely", "truly", "thực sự"),
    ("wether", "weather", "thời tiết"), ("loose", "lose", "đánh mất"), ("advise", "advice", "lời khuyên (danh từ)"),
    ("quite", "quiet", "yên tĩnh"), ("grammer", "grammar", "ngữ pháp"), ("accomodation", "accommodation", "chỗ ở"),
    ("begining", "beginning", "bắt đầu"), ("buisness", "business", "kinh doanh"), ("commitee", "committee", "ủy ban"),
    ("embaras", "embarrass", "ngượng ngùng"), ("goverment", "government", "chính phủ"), ("maintenence", "maintenance", "bảo trì"),
    ("posess", "possess", "sở hữu"), ("sincerly", "sincerely", "trân trọng"), ("suprise", "surprise", "ngạc nhiên"),
    ("visable", "visible", "có thể thấy"), ("wierd", "weird", "kỳ lạ"), ("achieve", "acheive", "đạt được")
]

spelling_full = []
for err, corr, meaning in spelling_samples:
    spelling_full.append({
        "input": f"I like that {err}.",
        "output": {
            "corrected_sentence": f"I like that {corr}.",
            "mistakes": [{"wrong": err, "reason": f"Lỗi chính tả của từ '{corr}' ({meaning}).", "fix": corr}],
            "natural_reply": f"The {corr} looks great indeed!",
            "follow_up_question": f"Do you have more than one {corr}?"
        }
    })

# 2. Grammar Correction (Diverse Patterns)
grammar_patterns = [
    ("She don't like", "She doesn't like", "Chủ ngữ số ít 'She' đi với 'doesn't'."),
    ("I am agree", "I agree", "'Agree' là động từ, không dùng với 'am'."),
    ("I didn't saw", "I didn't see", "Sau 'didn't' động từ phải ở dạng nguyên mẫu."),
    ("Every students", "Every student", "'Every' luôn đi với danh từ số ít."),
    ("He play soccer", "He plays soccer", "Chia động từ thêm 's' cho ngôi thứ 3 số ít."),
    ("I have 20 years old", "I am 20 years old", "Dùng 'be' khi nói về tuổi tác."),
    ("Listen me", "Listen to me", "Cụm từ đúng là 'listen to someone'."),
    ("I'm looking forward to meet you", "I'm looking forward to meeting you", "Sau 'looking forward to' là V-ing."),
    ("People is", "People are", "'People' là danh từ số nhiều."),
    ("Go to home", "Go home", "Không dùng 'to' trước 'home' trong cụm này.")
]

grammar_full = []
for wrong, right, reason in grammar_patterns:
    grammar_full.append({
        "input": f"{wrong} him.",
        "output": {
            "corrected_sentence": f"{right} him.",
            "mistakes": [{"wrong": wrong, "reason": reason, "fix": right}],
            "natural_reply": "That's a common point to discuss.",
            "follow_up_question": "How often do you talk to him?"
        }
    })

# 3. Natural Rewrite
natural_samples = [
    ("I am fine.", "I'm doing great, thanks!", "How's your day going?"),
    ("What is your name?", "May I ask what your name is?", "Do you have a nickname?"),
    ("No problem.", "You're very welcome!", "Is there anything else I can help with?"),
    ("I want food.", "I'm feeling a bit hungry.", "What kind of food are you craving?"),
    ("Wait a minute.", "Could you give me a second, please?", "Are you in a hurry?")
]

natural_full = []
for inp, rewrite, follow in natural_samples:
    natural_full.append({
        "input": inp,
        "output": {
            "corrected_sentence": rewrite,
            "mistakes": [],
            "natural_reply": "It's always better to be polite and natural.",
            "follow_up_question": follow
        }
    })

# 4. Generate Question
question_samples = [
    ("I like movies.", "I love watching movies too!", "What's the best movie you've seen recently?"),
    ("I'm a student.", "Being a student is an exciting time.", "What is your favorite subject?"),
    ("I live in Hanoi.", "Hanoi is such a vibrant city!", "Which part of Hanoi do you live in?"),
    ("I'm learning English.", "English is definitely a useful skill.", "How long have you been studying it?"),
    ("I have a cat.", "Cats are such wonderful companions.", "What is your cat's name?")
]

question_full = []
for inp, reply, follow in question_samples:
    question_full.append({
        "input": inp,
        "output": {
            "corrected_sentence": inp,
            "mistakes": [],
            "natural_reply": reply,
            "follow_up_question": follow
        }
    })

# 5. Explain (Grammar explanations)
explain_samples = [
    ("I go by foot.", "I go on foot.", "on foot", "Dùng 'on foot' cho hành động đi bộ."),
    ("Much people.", "Many people.", "many people", "Dùng 'many' cho danh từ đếm được số nhiều."),
    ("He is more tall.", "He is taller.", "taller", "Dùng đuôi '-er' cho tính từ ngắn khi so sánh hơn."),
    ("I lost the bus.", "I missed the bus.", "missed", "Dùng 'missed' khi bị lỡ phương tiện công cộng.")
]

explain_full = []
for inp, corr, wrong_part, reason in explain_samples:
    explain_full.append({
        "input": inp,
        "output": {
            "corrected_sentence": corr,
            "mistakes": [{"wrong": wrong_part, "reason": reason, "fix": corr}],
            "natural_reply": "Prepositions and collocations can be tricky!",
            "follow_up_question": "Does this happen to you often?"
        }
    })

save_json(spelling_full, os.path.join(output_dir, "spelling_correction.json"))
save_json(grammar_full, os.path.join(output_dir, "grammar_correction.json"))
save_json(natural_full, os.path.join(output_dir, "natural_rewrite.json"))
save_json(question_full, os.path.join(output_dir, "generate_question.json"))
save_json(explain_full, os.path.join(output_dir, "explanation.json"))

print(f"Generated {len(spelling_full) + len(grammar_full) + len(natural_full) + len(question_full) + len(explain_full)} unique examples in {output_dir}")
